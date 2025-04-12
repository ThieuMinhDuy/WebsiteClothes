import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Upload, message, Popconfirm, Spin, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct } from '../../services/api/productApi';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('Thêm sản phẩm mới');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Tải danh sách sản phẩm và danh mục
  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
      message.error('Đã xảy ra lỗi khi tải dữ liệu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Xử lý mở modal thêm sản phẩm
  const showAddModal = () => {
    setModalTitle('Thêm sản phẩm mới');
    setCurrentProduct(null);
    setFileList([]);
    form.resetFields();
    setModalVisible(true);
  };

  // Xử lý mở modal chỉnh sửa sản phẩm
  const showEditModal = (product) => {
    setModalTitle('Chỉnh sửa sản phẩm');
    setCurrentProduct(product);
    
    // Chuyển đổi dữ liệu ảnh thành fileList
    const images = product.images.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}.jpg`,
      status: 'done',
      url: url,
      base64: url.startsWith('data:') ? url : null,
    }));
    setFileList(images);
    
    // Thiết lập giá trị form
    form.setFieldsValue({
      ...product,
      // Chuyển đổi mảng sizes và colors thành chuỗi phân cách bởi dấu phẩy để dễ hiển thị
      sizes: product.sizes.join(','),
      colors: product.colors.join(','),
    });
    
    setModalVisible(true);
  };

  // Xử lý đóng modal
  const handleCancel = () => {
    setModalVisible(false);
  };

  // Xử lý lưu sản phẩm
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // Xử lý sizes và colors từ chuỗi thành mảng
      const sizes = values.sizes.split(',').map(size => size.trim());
      const colors = values.colors.split(',').map(color => color.trim());
      
      // Lấy URLs từ fileList (base64 hoặc url)
      const images = fileList.map(file => file.base64 || file.url);
      
      // Tạo đối tượng sản phẩm
      const productData = {
        ...values,
        sizes,
        colors,
        images,
      };
      
      if (currentProduct) {
        // Cập nhật sản phẩm
        await updateProduct(currentProduct.id, productData);
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        // Thêm sản phẩm mới
        await createProduct(productData);
        message.success('Thêm sản phẩm mới thành công!');
      }
      
      // Đóng modal và tải lại dữ liệu
      setModalVisible(false);
      fetchData();
      
    } catch (error) {
      console.error('Lỗi khi lưu sản phẩm:', error);
      message.error('Đã xảy ra lỗi khi lưu sản phẩm');
    }
  };

  // Xử lý xóa sản phẩm
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      message.success('Xóa sản phẩm thành công!');
      fetchData();
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      message.error('Đã xảy ra lỗi khi xóa sản phẩm');
    }
  };

  // Xử lý upload ảnh
  const handleUploadChange = ({ fileList: newFileList }) => {
    // Xử lý các file mới và chuyển đổi thành base64
    const processedFileList = [...newFileList];
    
    // Nếu có file mới chưa được xử lý
    newFileList.forEach((file, index) => {
      if (file.originFileObj && !file.base64) {
        getBase64(file.originFileObj, (base64Url) => {
          processedFileList[index] = {
            ...processedFileList[index],
            url: base64Url,
            base64: base64Url,
          };
          setFileList([...processedFileList]);
        });
      }
    });
    
    setFileList(newFileList);
  };

  // Hàm chuyển đổi file thành base64
  const getBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(file);
  };

  // Trước khi upload
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Bạn chỉ có thể tải lên file ảnh!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Ảnh phải nhỏ hơn 2MB!');
    }
    return isImage && isLt2M;
  };

  // Tùy chỉnh upload button
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  // Định nghĩa cột cho bảng sản phẩm
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
      render: (images) => (
        <img 
          src={images[0] || "https://via.placeholder.com/50x50?text=No+Image"} 
          alt="product" 
          style={{ width: 50, height: 50, objectFit: 'cover' }} 
        />
      ),
      width: 80,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString('vi-VN')}đ`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Không xác định';
      },
      filters: categories.map(c => ({ text: c.name, value: c.id })),
      onFilter: (value, record) => record.categoryId === value,
    },
    {
      title: 'Kích thước',
      dataIndex: 'sizes',
      key: 'sizes',
      render: (sizes) => sizes.join(', '),
    },
    {
      title: 'Màu sắc',
      dataIndex: 'colors',
      key: 'colors',
      render: (colors) => colors.join(', '),
    },
    {
      title: 'Số lượng',
      dataIndex: 'inStock',
      key: 'inStock',
      sorter: (a, b) => a.inStock - b.inStock,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>Quản lý sản phẩm</Title>
        <Button 
          type="primary" 
          onClick={showAddModal} 
          icon={<PlusOutlined />}
        >
          Thêm sản phẩm
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table 
          columns={columns} 
          dataSource={products} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      )}

      {/* Modal thêm/sửa sản phẩm */}
      <Modal
        title={modalTitle}
        visible={modalVisible}
        onCancel={handleCancel}
        onOk={handleSave}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            price: 0,
            inStock: 0,
            sizes: '',
            colors: '',
          }}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={1000} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="sizes"
            label="Kích thước (phân cách bởi dấu phẩy, VD: S,M,L,XL)"
            rules={[{ required: true, message: 'Vui lòng nhập kích thước!' }]}
          >
            <Input placeholder="VD: S,M,L,XL" />
          </Form.Item>

          <Form.Item
            name="colors"
            label="Màu sắc (phân cách bởi dấu phẩy, VD: Đen,Trắng,Xanh)"
            rules={[{ required: true, message: 'Vui lòng nhập màu sắc!' }]}
          >
            <Input placeholder="VD: Đen,Trắng,Xanh" />
          </Form.Item>

          <Form.Item
            name="inStock"
            label="Số lượng trong kho"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            label="Hình ảnh sản phẩm"
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
              multiple={true}
            >
              {fileList.length >= 10 ? null : uploadButton}
            </Upload>
            <Text type="secondary">Tải lên tối đa 10 ảnh, mỗi ảnh không quá 2MB</Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagementPage;
