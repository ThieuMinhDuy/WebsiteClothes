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
  const [selectedTab, setSelectedTab] = useState('general');
  const [colorFileLists, setColorFileLists] = useState({});
  const [availableColors, setAvailableColors] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

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
    setColorFileLists({});
    setAvailableColors([]);
    setSelectedTab('general');
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
    
    // Xử lý ảnh theo màu nếu có
    const colors = product.colors || [];
    setAvailableColors(colors.map(color => color.trim()));
    
    const colorImagesData = {};
    if (product.colorImages) {
      Object.entries(product.colorImages).forEach(([color, urls]) => {
        colorImagesData[color] = urls.map((url, index) => ({
          uid: `${color}-${index}`,
          name: `${color}-image-${index}.jpg`,
          status: 'done',
          url: url,
          base64: url.startsWith('data:') ? url : null,
        }));
      });
    }
    setColorFileLists(colorImagesData);
    
    setSelectedTab('general');
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
      
      // Xử lý ảnh theo màu
      const colorImages = {};
      Object.entries(colorFileLists).forEach(([color, files]) => {
        if (files && files.length > 0) {
          colorImages[color] = files.map(file => file.base64 || file.url);
        }
      });
      
      // Tạo đối tượng sản phẩm
      const productData = {
        ...values,
        sizes,
        colors,
        images,
        colorImages: Object.keys(colorImages).length > 0 ? colorImages : undefined,
      };
      
      // Nếu discount = 0, đặt oldPrice giống với price để không hiển thị giá gạch ngang
      if (productData.discount === 0) {
        productData.oldPrice = productData.price;
      }
      
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

  // Xử lý upload ảnh cho màu cụ thể
  const handleColorUploadChange = (color, { fileList: newFileList }) => {
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
          setColorFileLists(prev => ({
            ...prev,
            [color]: [...processedFileList]
          }));
        });
      }
    });
    
    setColorFileLists(prev => ({
      ...prev,
      [color]: newFileList
    }));
  };

  // Cập nhật danh sách màu khi người dùng thay đổi trường màu sắc
  const handleColorsChange = (e) => {
    const colors = e.target.value.split(',').map(color => color.trim());
    setAvailableColors(colors);
    
    // Loại bỏ các màu không còn trong danh sách
    const updatedColorFileLists = {};
    Object.entries(colorFileLists).forEach(([color, files]) => {
      if (colors.includes(color)) {
        updatedColorFileLists[color] = files;
      }
    });
    setColorFileLists(updatedColorFileLists);
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

  const setEditingProduct = (record) => {
    setIsEditing(true);
    form.setFieldsValue({
      id: record.id,
      name: record.name,
      oldPrice: record.oldPrice,
      discount: record.discount,
      price: record.price,
      description: record.description,
      categoryId: record.categoryId,
      uploadedImages: record.images || [],
    });
    
    // Calculate price automatically if oldPrice and discount are available
    if (record.oldPrice && record.discount !== undefined) {
      const calculatedPrice = Math.round(record.oldPrice * (100 - record.discount) / 100);
      form.setFieldsValue({ price: calculatedPrice });
    }
    
    setFileList(record.images ? record.images.map(img => ({
      uid: img.id,
      name: img.url.split('/').pop(),
      status: 'done',
      url: img.url,
      response: { id: img.id }
    })) : []);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Quản lý sản phẩm</Title>
      
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={showAddModal}
        style={{ marginBottom: 16 }}
      >
        Thêm sản phẩm mới
      </Button>
      
      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      {/* Modal thêm/sửa sản phẩm */}
      <Modal
        title={modalTitle}
        visible={modalVisible}
        onOk={handleSave}
        onCancel={handleCancel}
        width={800}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handleSave}>
            Lưu
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          {/* Tab để quản lý các phần khác nhau của sản phẩm */}
          <div style={{ marginBottom: '20px' }}>
            <Space>
              <Button 
                type={selectedTab === 'general' ? 'primary' : 'default'} 
                onClick={() => setSelectedTab('general')}
              >
                Thông tin chung
              </Button>
              <Button 
                type={selectedTab === 'images' ? 'primary' : 'default'} 
                onClick={() => setSelectedTab('images')}
              >
                Hình ảnh chung
              </Button>
              <Button 
                type={selectedTab === 'colorImages' ? 'primary' : 'default'} 
                onClick={() => setSelectedTab('colorImages')}
                disabled={availableColors.length === 0}
              >
                Hình ảnh theo màu
              </Button>
            </Space>
          </div>
          
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              inStock: 1,
              discount: 0
            }}
          >
            {selectedTab === 'general' && (
              <>
                <Form.Item
                  name="name"
                  label="Tên sản phẩm"
                  rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                >
                  <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>
                
                <Form.Item
                  name="description"
                  label="Mô tả"
                >
                  <TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
                </Form.Item>
                
                <Form.Item
                  name="oldPrice"
                  label="Giá gốc (VNĐ)"
                  rules={[{ required: true, message: 'Vui lòng nhập giá gốc sản phẩm!' }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }} 
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="Nhập giá gốc sản phẩm" 
                    onChange={(value) => {
                      const discount = form.getFieldValue('discount') || 0;
                      if (value && value > 0) {
                        if (discount > 0) {
                          const calculatedPrice = Math.round(value * (100 - discount) / 100);
                          form.setFieldsValue({ price: calculatedPrice });
                        } else {
                          form.setFieldsValue({ price: value });
                        }
                      } else {
                        form.setFieldsValue({ price: null });
                      }
                    }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="discount"
                  label="Giảm giá (%)"
                >
                  <InputNumber 
                    style={{ width: '100%' }} 
                    min={0} 
                    max={100} 
                    placeholder="Nhập % giảm giá (nếu có)" 
                    onChange={(value) => {
                      const oldPrice = form.getFieldValue('oldPrice');
                      if (oldPrice && oldPrice > 0) {
                        if (value && value > 0) {
                          const calculatedPrice = Math.round(oldPrice * (100 - value) / 100);
                          form.setFieldsValue({ price: calculatedPrice });
                        } else {
                          // Nếu giảm giá = 0 hoặc không có, giá hiện tại sẽ bằng giá gốc
                          form.setFieldsValue({ price: oldPrice });
                        }
                      } else {
                        form.setFieldsValue({ price: null });
                      }
                    }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="price"
                  label="Giá hiện tại (VNĐ)"
                  rules={[{ required: true, message: 'Vui lòng nhập giá sản phẩm!' }]}
                  tooltip="Giá này được tự động tính khi bạn nhập giá gốc và % giảm giá"
                >
                  <InputNumber 
                    style={{ width: '100%', backgroundColor: '#f5f5f5' }} 
                    min={0}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="Giá sau khi giảm (tự động tính)" 
                    disabled={true}
                    readOnly={true}
                  />
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
                  name="collection"
                  label="Bộ sưu tập"
                >
                  <Select placeholder="Chọn bộ sưu tập">
                    <Option value="winter">Thu Đông</Option>
                    <Option value="heattech">Heattech</Option>
                    <Option value="ut">UT (Áo phông họa tiết)</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="sizes"
                  label="Kích cỡ"
                  rules={[{ required: true, message: 'Vui lòng nhập các kích cỡ sản phẩm!' }]}
                >
                  <Input placeholder="Nhập kích cỡ, phân cách bằng dấu phẩy (vd: S,M,L,XL)" />
                </Form.Item>
                
                <Form.Item
                  name="colors"
                  label="Màu sắc"
                  rules={[{ required: true, message: 'Vui lòng nhập các màu sắc sản phẩm!' }]}
                >
                  <Input 
                    placeholder="Nhập màu sắc, phân cách bằng dấu phẩy (vd: Đen,Trắng,Đỏ)" 
                    onChange={handleColorsChange}
                  />
                </Form.Item>
                
                <Form.Item
                  name="inStock"
                  label="Số lượng trong kho"
                  rules={[{ required: true, message: 'Vui lòng nhập số lượng trong kho!' }]}
                >
                  <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập số lượng trong kho" />
                </Form.Item>
              </>
            )}
            
            {selectedTab === 'images' && (
              <Form.Item label="Hình ảnh sản phẩm (chung)">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={beforeUpload}
                  customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
                  multiple
                >
                  {fileList.length >= 8 ? null : uploadButton}
                </Upload>
                <Text type="secondary">Upload các hình ảnh chung của sản phẩm (tối đa 8 ảnh)</Text>
              </Form.Item>
            )}
            
            {selectedTab === 'colorImages' && (
              <div>
                <Title level={4}>Hình ảnh theo màu sắc</Title>
                <Text type="secondary" style={{ marginBottom: '20px', display: 'block' }}>
                  Thêm ảnh riêng cho từng màu sắc. Khi người dùng chọn màu, ảnh sản phẩm sẽ thay đổi tương ứng.
                </Text>
                
                {availableColors.map(color => (
                  <div key={color} style={{ marginBottom: '20px' }}>
                    <Title level={5}>{color}</Title>
                    <Upload
                      listType="picture-card"
                      fileList={colorFileLists[color] || []}
                      onChange={(info) => handleColorUploadChange(color, info)}
                      beforeUpload={beforeUpload}
                      customRequest={({ onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
                      multiple
                    >
                      {(colorFileLists[color]?.length || 0) >= 8 ? null : uploadButton}
                    </Upload>
                  </div>
                ))}
                
                {availableColors.length === 0 && (
                  <Text type="warning">
                    Vui lòng thêm màu sắc trong tab "Thông tin chung" trước khi thêm ảnh theo màu.
                  </Text>
                )}
              </div>
            )}
          </Form>
        </Spin>
      </Modal>
    </div>
  );
};

export default ProductManagementPage;
