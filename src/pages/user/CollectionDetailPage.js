import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Typography, 
  Divider, 
  Spin, 
  Button, 
  Card, 
  Tag, 
  Empty,
  Breadcrumb,
  Carousel
} from 'antd';
import { 
  ShoppingCartOutlined, 
  ArrowRightOutlined, 
  HomeOutlined,
  DownOutlined
} from '@ant-design/icons';
import { getProductsByCollection, getCollectionById } from '../../services/api/productApi';
import { useCart } from '../../contexts/CartContext';

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

// Dữ liệu mẫu về bộ sưu tập
const collectionsData = [
  {
    id: 'winter',
    name: 'BỘ SƯU TẬP THU ĐÔNG 2025',
    description: 'Khám phá những thiết kế mới nhất phù hợp cho mùa Thu Đông với chất liệu giữ ấm tối ưu và thiết kế thời thượng.',
    image: '/assets/images/thudong.jpg',
    longDescription: 'Bộ sưu tập Thu Đông 2025 mang đến những thiết kế hiện đại, ấm áp với tông màu trầm ấm. Các sản phẩm được làm từ chất liệu cao cấp, giữ nhiệt tốt, phù hợp cho thời tiết lạnh.',
    bannerImage: '/assets/images/winter_banner.jpg',
    sections: [
      {
        title: 'Chất liệu cao cấp',
        description: 'Sử dụng len merino, cashmere và cotton hữu cơ để mang lại cảm giác ấm áp, mềm mại nhưng vẫn thoáng khí.'
      },
      {
        title: 'Thiết kế thời thượng',
        description: 'Phong cách tối giản nhưng tinh tế, dễ dàng mix & match với nhiều items khác trong tủ đồ của bạn.'
      },
      {
        title: 'Đa dạng màu sắc',
        description: 'Tông màu trầm ấm như nâu, be, xám, đen - dễ dàng phối hợp tạo nên phong cách riêng.'
      }
    ]
  },
  {
    id: 'heattech',
    name: 'HEATTECH - CÔNG NGHỆ GIỮ NHIỆT',
    description: 'Mỏng nhẹ nhưng vẫn giữ ấm hiệu quả trong thời tiết lạnh với công nghệ HEATTECH độc quyền.',
    image: '/assets/images/heatech.jpg',
    longDescription: 'Công nghệ HEATTECH độc quyền sử dụng sợi vải đặc biệt có khả năng chuyển đổi hơi ẩm từ cơ thể thành nhiệt, giúp giữ ấm hiệu quả mà vẫn mỏng nhẹ, thoải mái khi mặc.',
    bannerImage: '/assets/images/heattech_banner.jpg',
    sections: [
      {
        title: 'Công nghệ độc quyền',
        description: 'HEATTECH chuyển đổi hơi ẩm từ cơ thể thành nhiệt, giúp giữ ấm hiệu quả ngay cả trong thời tiết lạnh giá.'
      },
      {
        title: 'Mỏng nhẹ, thoải mái',
        description: 'Thiết kế mỏng nhẹ, co giãn tốt, thoải mái khi vận động và dễ dàng layering mà không gây cảm giác cồng kềnh.'
      },
      {
        title: 'Đa dạng sản phẩm',
        description: 'Từ áo giữ nhiệt, quần legging đến áo thun, có nhiều mức độ giữ ấm khác nhau phù hợp với nhiều hoạt động.'
      }
    ]
  },
  {
    id: 'ut',
    name: 'UT - ÁO PHÔNG IN HỌA TIẾT',
    description: 'Bộ sưu tập áo phông với những họa tiết độc quyền từ các nghệ sĩ toàn cầu và các thương hiệu nổi tiếng.',
    image: '/assets/images/aophong.webp',
    longDescription: 'UT (Unique T-shirt) là dòng áo phông với họa tiết độc đáo được hợp tác với các nghệ sĩ và thương hiệu nổi tiếng toàn cầu. Mỗi chiếc áo là một tác phẩm nghệ thuật, thể hiện cá tính riêng của người mặc.',
    bannerImage: '/assets/images/ut_banner.jpg',
    sections: [
      {
        title: 'Hợp tác độc quyền',
        description: 'Kết hợp cùng các nghệ sĩ, thương hiệu và IP nổi tiếng toàn cầu như Marvel, Disney, Star Wars...'
      },
      {
        title: 'Chất liệu cotton cao cấp',
        description: 'Sử dụng 100% cotton hữu cơ, mềm mại, thấm hút mồ hôi tốt, thoải mái khi mặc cả ngày dài.'
      },
      {
        title: 'Thiết kế đa dạng',
        description: 'Từ phong cách đơn giản, minimalist đến những họa tiết phức tạp, đầy màu sắc - phù hợp với mọi cá tính.'
      }
    ]
  },
  {
    id: 'summer',
    name: 'BỘ SƯU TẬP HÈ 2025',
    description: 'Tươi mát và phong cách với những thiết kế dành cho mùa hè sôi động.',
    image: '/assets/images/bst hè.jpg',
    longDescription: 'Bộ sưu tập Hè 2025 mang đến những thiết kế tươi mát với tông màu sáng, chất liệu nhẹ, thấm hút mồ hôi tốt. Các sản phẩm phù hợp cho những ngày hè nóng bức, từ đi biển đến dạo phố.',
    bannerImage: '/assets/images/summer_banner.jpg',
    sections: [
      {
        title: 'Chất liệu thoáng mát',
        description: 'Linen, cotton nhẹ và các chất liệu thân thiện với môi trường, giúp bạn luôn cảm thấy thoải mái trong những ngày nắng nóng.'
      },
      {
        title: 'Sắc màu rực rỡ',
        description: 'Bảng màu tươi sáng như trắng, xanh biển, vàng, cam... mang đến năng lượng tích cực cho mùa hè sôi động.'
      },
      {
        title: 'Phong cách đa dạng',
        description: 'Từ trang phục đi biển, dạo phố đến những buổi tiệc ngoài trời - đáp ứng mọi nhu cầu trong mùa hè.'
      }
    ]
  }
];

const CollectionDetailPage = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCollectionAndProducts = async () => {
      setLoading(true);
      
      try {
        // Tìm thông tin bộ sưu tập theo id
        const collectionInfo = await getCollectionById(id);
        setCollection(collectionInfo);
        
        // Lấy sản phẩm thuộc bộ sưu tập này
        const collectionProducts = await getProductsByCollection(id);
        setProducts(collectionProducts);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCollectionAndProducts();
  }, [id]);
  
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes[0], product.colors[0]);
  };
  
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (!collection) {
    return (
      <Empty 
        description="Không tìm thấy bộ sưu tập" 
        style={{ padding: '100px 0' }}
      />
    );
  }

  return (
    <div style={{ margin: '-32px -50px 0' }}>
      {/* Hero Banner Full Width */}
      <div style={{ 
        position: 'relative', 
        height: '100vh',
        width: '100%',
        overflow: 'hidden'
      }}>
        <img 
          src={collection.image} 
          alt={collection.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)'
        }}>
          <div style={{ textAlign: 'center', color: 'white', padding: '0 20px', maxWidth: '900px' }}>
            <Title style={{ color: 'white', fontSize: '60px', marginBottom: '20px', fontWeight: '600' }}>
              {collection.name}
            </Title>
            <Paragraph style={{ color: 'white', fontSize: '20px', marginBottom: '40px' }}>
              {collection.description}
            </Paragraph>
            <Button 
              type="primary" 
              size="large"
              icon={<DownOutlined />}
              style={{ 
                backgroundColor: 'transparent', 
                borderColor: 'white',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '40px'
              }}
              onClick={() => {
                window.scrollTo({
                  top: window.innerHeight,
                  behavior: 'smooth'
                });
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Content Section - Slides up from behind the hero banner */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '60px 0',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          {/* Breadcrumb Navigation */}
          <Breadcrumb style={{ marginBottom: '40px' }}>
            <Breadcrumb.Item>
              <Link to="/"><HomeOutlined /> Trang chủ</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link to="/collections">Bộ sưu tập</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{collection.name}</Breadcrumb.Item>
          </Breadcrumb>
          
          {/* Collection Description */}
          <div style={{ marginBottom: '70px' }}>
            <Title level={2} style={{ fontSize: '36px', fontWeight: '600', marginBottom: '30px' }}>Giới thiệu</Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '40px' }}>
              {collection.longDescription}
            </Paragraph>
            
            <Row gutter={[32, 32]} style={{ marginTop: '50px' }}>
              {collection.sections?.map((section, index) => (
                <Col xs={24} md={8} key={index}>
                  <Card 
                    bordered={false} 
                    style={{ 
                      height: '100%', 
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                      borderRadius: '8px'
                    }}
                  >
                    <Title level={4}>{section.title}</Title>
                    <Paragraph>{section.description}</Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
          
          {/* Collection Products */}
          <div>
            <Title level={2} style={{ fontSize: '36px', fontWeight: '600', marginBottom: '30px', textAlign: 'center' }}>
              Sản phẩm trong bộ sưu tập
              <Tag color="red" style={{ marginLeft: '10px' }}>{products.length} sản phẩm</Tag>
            </Title>
            
            <Divider style={{ margin: '30px 0 50px' }} />
            
            {products.length === 0 ? (
              <Empty description="Chưa có sản phẩm trong bộ sưu tập này" />
            ) : (
              <Row gutter={[32, 48]}>
                {products.map(product => (
                  <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                    <Link to={`/products/${product.id}`}>
                      <Card
                        hoverable
                        style={{ 
                          border: 'none', 
                          borderRadius: '8px', 
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                        cover={
                          <div style={{ overflow: 'hidden' }}>
                            <img 
                              alt={product.name} 
                              src={product.images[0]}
                              style={{ 
                                height: '300px', 
                                objectFit: 'cover',
                                width: '100%',
                                transition: 'transform 0.5s ease'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                          </div>
                        }
                      >
                        <Meta 
                          title={<span style={{ fontSize: '16px' }}>{product.name}</span>}
                          description={
                            <div>
                              <div style={{ height: '50px' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '10px' }}>
                                  <div style={{ color: 'red', fontWeight: 'bold', fontSize: '18px' }}>
                                    {product.price.toLocaleString('vi-VN')}đ
                                  </div>
                                  {product.discount > 0 && product.oldPrice !== product.price && (
                                    <Text delete type="secondary" style={{ marginLeft: '8px' }}>
                                      {product.oldPrice.toLocaleString('vi-VN')}đ
                                    </Text>
                                  )}
                                </div>
                                {!(product.discount > 0 && product.oldPrice !== product.price) ? (
                                  <div style={{ height: '14px', marginTop: '4px' }}></div>
                                ) : null}
                              </div>
                              
                              <Button 
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                size="middle"
                                style={{ marginTop: '15px', borderRadius: '4px', width: '100%' }}
                                onClick={(e) => handleAddToCart(e, product)}
                              >
                                Thêm vào giỏ
                              </Button>
                            </div>
                          }
                        />
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '70px' }}>
              <Link to="/products">
                <Button 
                  type="primary" 
                  size="large"
                  style={{ 
                    backgroundColor: '#000', 
                    borderColor: '#000',
                    borderRadius: '0',
                    height: '50px',
                    padding: '0 40px',
                    fontSize: '16px'
                  }}
                >
                  Xem tất cả sản phẩm <ArrowRightOutlined />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionDetailPage; 