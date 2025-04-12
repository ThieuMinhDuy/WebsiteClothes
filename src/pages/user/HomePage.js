import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Carousel, Button, List, Spin, Divider } from 'antd';
import { RightOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../../services/api/productApi';

const { Title } = Typography;
const { Meta } = Card;

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy tất cả sản phẩm (trong ứng dụng thực, sẽ có API riêng cho sản phẩm nổi bật)
        const products = await getProducts();
        // Chỉ lấy 8 sản phẩm đầu tiên cho phần nổi bật
        setFeaturedProducts(products.slice(0, 8));
        
        // Lấy danh sách danh mục
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const carouselStyle = {
    height: '400px',
    color: '#fff',
    lineHeight: '400px',
    textAlign: 'center',
    background: '#364d79',
  };

  return (
    <div>
      {/* Banner Carousel */}
      <Carousel autoplay>
        <div>
          <h3 style={carouselStyle}>
            <img 
              src="https://via.placeholder.com/1200x400?text=Thời+Trang+Nam+Nữ" 
              alt="Banner 1"
              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
            />
          </h3>
        </div>
        <div>
          <h3 style={carouselStyle}>
            <img 
              src="https://via.placeholder.com/1200x400?text=Khuyến+Mãi+50%" 
              alt="Banner 2"
              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
            />
          </h3>
        </div>
      </Carousel>

      {/* Danh mục sản phẩm */}
      <div style={{ padding: '40px 0' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 40 }}>Danh Mục Sản Phẩm</Title>
        
        <Row gutter={[16, 16]} justify="center">
          {loading ? (
            <Spin size="large" />
          ) : (
            categories.map(category => (
              <Col xs={12} sm={8} md={6} key={category.id}>
                <Link to={`/products?category=${category.id}`}>
                  <Card
                    hoverable
                    cover={
                      <div style={{ 
                        height: 150, 
                        background: '#f5f5f5', 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center' 
                      }}>
                        <Typography.Title level={3}>{category.name}</Typography.Title>
                      </div>
                    }
                  >
                    <Meta 
                      title={category.name} 
                      description={
                        <Button type="link" style={{ padding: 0 }}>
                          Xem sản phẩm <RightOutlined />
                        </Button>
                      } 
                    />
                  </Card>
                </Link>
              </Col>
            ))
          )}
        </Row>
      </div>

      {/* Sản phẩm nổi bật */}
      <div style={{ padding: '40px 0' }}>
        <Divider>
          <Title level={2}>Sản Phẩm Nổi Bật</Title>
        </Divider>
        
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xl: 4,
            xxl: 4,
          }}
          loading={loading}
          dataSource={featuredProducts}
          renderItem={item => (
            <List.Item>
              <Link to={`/products/${item.id}`}>
                <Card
                  hoverable
                  cover={
                    <img 
                      alt={item.name} 
                      src={item.images[0] || "https://via.placeholder.com/300x300?text=No+Image"} 
                      style={{ height: 300, objectFit: 'cover' }}
                    />
                  }
                  actions={[
                    <Button type="primary" icon={<ShoppingCartOutlined />}>
                      Thêm vào giỏ
                    </Button>
                  ]}
                >
                  <Meta 
                    title={item.name} 
                    description={
                      <div>
                        <Typography.Paragraph>{item.description.slice(0, 50)}...</Typography.Paragraph>
                        <Typography.Title level={5} style={{ color: 'red' }}>
                          {item.price.toLocaleString('vi-VN')} đ
                        </Typography.Title>
                      </div>
                    } 
                  />
                </Card>
              </Link>
            </List.Item>
          )}
        />
        
        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <Link to="/products">
            <Button type="primary" size="large">Xem tất cả sản phẩm</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
