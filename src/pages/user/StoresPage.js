import React, { useState } from 'react';
import { Row, Col, Typography, Divider, Carousel, Button } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, ClockCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const storeLocations = [
  {
    id: 1,
    name: 'UNIQLO Vincom Center Bà Triệu',
    address: 'Tầng 3, Vincom Center Bà Triệu, 191 Bà Triệu, Hai Bà Trưng, Hà Nội',
    phone: '1900 1234',
    hours: '9:00 - 22:00',
    position: { lat: 21.0135, lng: 105.8521 },
    description: 'Cửa hàng UNIQLO đầu tiên tại Hà Nội với không gian rộng rãi và đầy đủ các sản phẩm mới nhất',
    images: [
      '/assets/images/store1.jpg',
      '/assets/images/store2.jpg',
      '/assets/images/store3.jpg'
    ]
  },
  {
    id: 2,
    name: 'UNIQLO Vincom Mega Mall Royal City',
    address: 'Tầng 2, Vincom Mega Mall Royal City, 72A Nguyễn Trãi, Thanh Xuân, Hà Nội',
    phone: '1900 1235',
    hours: '9:00 - 22:00',
    position: { lat: 20.9955, lng: 105.8144 },
    description: 'Cửa hàng UNIQLO tại trung tâm thương mại lớn nhất khu vực phía Tây Hà Nội',
    images: [
      '/assets/images/store4.jpg',
      '/assets/images/store5.jpg',
      '/assets/images/store6.jpg'
    ]
  },
  {
    id: 3,
    name: 'UNIQLO Crescent Mall',
    address: 'Tầng 2, Crescent Mall, 101 Tôn Dật Tiên, Phú Mỹ Hưng, Quận 7, TP.HCM',
    phone: '1900 1236',
    hours: '9:00 - 22:00',
    position: { lat: 10.7297, lng: 106.7229 },
    description: 'Cửa hàng UNIQLO đầu tiên tại TP.HCM với thiết kế hiện đại và không gian mua sắm thoải mái',
    images: [
      '/assets/images/store4.jpg',
      '/assets/images/store5.jpg',
      '/assets/images/store6.jpg'
    ]
  }
];

const StoreSection = ({ store }) => {
  const carouselRef = React.useRef();
  
  // Reset carousel về slide đầu tiên khi đổi cửa hàng
  React.useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.goTo(0);
    }
  }, [store.id]);
  
  return (
    <div>
      {/* Phần slide ảnh */}
      <div style={{ position: 'relative', width: '100%' }}>
        <Button
          type="primary"
          shape="circle"
          icon={<LeftOutlined />}
          size="large"
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.8)',
            color: '#ff0000',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
          onClick={() => carouselRef.current.prev()}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<RightOutlined />}
          size="large"
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.8)',
            color: '#ff0000',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
          onClick={() => carouselRef.current.next()}
        />
        <Carousel 
          ref={carouselRef}
          autoplay 
          autoplaySpeed={5000}
          effect="fade"
          dots={true}
          dotPosition="bottom"
          style={{ width: '100%' }}
        >
          {/* Slide 1 */}
          <div style={{ 
            position: 'relative',
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            background: '#f9f9f9'
          }}>
            <Row gutter={[40, 40]} style={{ width: '95%', maxWidth: '1400px', margin: '0 auto' }}>
              <Col xs={24} md={14} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  position: 'relative',
                  width: '100%',
                  height: '65vh',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <img
                    src={store.images[0]}
                    alt={`${store.name} - Ảnh 1`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '30px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)',
                    color: 'white'
                  }}>
                    <Title level={2} style={{ 
                      color: 'white', 
                      marginBottom: '8px',
                      fontSize: '28px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}>
                      {store.name}
                    </Title>
                    <Text style={{ 
                      fontSize: '16px', 
                      display: 'block', 
                      marginBottom: '8px',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      lineHeight: '1.4'
                    }}>
                      {store.description}
                    </Text>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={10}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    marginBottom: '20px'
                  }}>
                    <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                      <EnvironmentOutlined style={{ marginRight: '8px', color: '#ff0000', fontSize: '16px' }} />
                      <Text strong>{store.address}</Text>
                    </div>
                    
                    <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                      <PhoneOutlined style={{ marginRight: '8px', color: '#ff0000', fontSize: '16px' }} />
                      <Text strong>{store.phone}</Text>
                    </div>
                    
                    <div style={{ fontSize: '14px' }}>
                      <ClockCircleOutlined style={{ marginRight: '8px', color: '#ff0000', fontSize: '16px' }} />
                      <Text strong>{store.hours}</Text>
                    </div>
                  </div>
                  
                  <div style={{ 
                    flex: 1,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minHeight: '300px'
                  }}>
                    <iframe
                      title={`Bản đồ ${store.name}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(store.address)}&output=embed`}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          
          {/* Slide 2 */}
          <div style={{ 
            position: 'relative',
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            background: '#f9f9f9'
          }}>
            <Row gutter={[40, 40]} style={{ width: '95%', maxWidth: '1400px', margin: '0 auto' }}>
              <Col xs={24} md={14} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  position: 'relative',
                  width: '100%',
                  height: '65vh',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <img
                    src={store.images[1]}
                    alt={`${store.name} - Ảnh 2`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '30px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)',
                    color: 'white'
                  }}>
                    <Title level={2} style={{ 
                      color: 'white', 
                      marginBottom: '8px',
                      fontSize: '28px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}>
                      {store.name}
                    </Title>
                    <Text style={{ 
                      fontSize: '16px', 
                      display: 'block', 
                      marginBottom: '8px',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      lineHeight: '1.4'
                    }}>
                      {store.description}
                    </Text>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={10}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    marginBottom: '20px'
                  }}>
                    <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                      <EnvironmentOutlined style={{ marginRight: '8px', color: '#ff0000', fontSize: '16px' }} />
                      <Text strong>{store.address}</Text>
                    </div>
                    
                    <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                      <PhoneOutlined style={{ marginRight: '8px', color: '#ff0000', fontSize: '16px' }} />
                      <Text strong>{store.phone}</Text>
                    </div>
                    
                    <div style={{ fontSize: '14px' }}>
                      <ClockCircleOutlined style={{ marginRight: '8px', color: '#ff0000', fontSize: '16px' }} />
                      <Text strong>{store.hours}</Text>
                    </div>
                  </div>
                  
                  <div style={{ 
                    flex: 1,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minHeight: '300px'
                  }}>
                    <iframe
                      title={`Bản đồ ${store.name}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(store.address)}&output=embed`}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          
          {/* Slide 3 */}
          <div style={{ 
            position: 'relative',
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            background: '#f9f9f9'
          }}>
            <Row gutter={[40, 40]} style={{ width: '95%', maxWidth: '1400px', margin: '0 auto' }}>
              <Col xs={24} md={14} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                  position: 'relative',
                  width: '100%',
                  height: '65vh',
                  overflow: 'hidden',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <img
                    src={store.images[2]}
                    alt={`${store.name} - Ảnh 3`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '30px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)',
                    color: 'white'
                  }}>
                    <Title level={2} style={{ 
                      color: 'white', 
                      marginBottom: '8px',
                      fontSize: '28px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}>
                      {store.name}
                    </Title>
                    <Text style={{ 
                      fontSize: '16px', 
                      display: 'block', 
                      marginBottom: '8px',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      lineHeight: '1.4'
                    }}>
                      {store.description}
                    </Text>
                  </div>
                </div>
              </Col>
              
              <Col xs={24} md={10}>
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    marginBottom: '20px'
                  }}>
                    <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                      <EnvironmentOutlined style={{ marginRight: '8px', color: '#ff0000', fontSize: '16px' }} />
                      <Text strong>{store.address}</Text>
                    </div>
                    
                    <div style={{ marginBottom: '10px', fontSize: '14px' }}>
                      <PhoneOutlined style={{ marginRight: '8px', color: '#ff0000', fontSize: '16px' }} />
                      <Text strong>{store.phone}</Text>
                    </div>
                    
                    <div style={{ fontSize: '14px' }}>
                      <ClockCircleOutlined style={{ marginRight: '8px', color: '#ff0000', fontSize: '16px' }} />
                      <Text strong>{store.hours}</Text>
                    </div>
                  </div>
                  
                  <div style={{ 
                    flex: 1,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minHeight: '300px'
                  }}>
                    <iframe
                      title={`Bản đồ ${store.name}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(store.address)}&output=embed`}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Carousel>
      </div>
    </div>
  );
};

const StoresPage = () => {
  const [currentStoreIndex, setCurrentStoreIndex] = useState(0);

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      <StoreSection store={storeLocations[currentStoreIndex]} />

      <div style={{ 
        textAlign: 'center', 
        padding: '20px',
        background: '#f9f9f9'
      }}>
        <Button 
          type="primary" 
          onClick={() => setCurrentStoreIndex((currentStoreIndex + 1) % storeLocations.length)}
          style={{ 
            background: '#ff0000',
            borderColor: '#ff0000',
            marginRight: '16px'
          }}
        >
          Xem cửa hàng tiếp theo
        </Button>
      </div>
    </div>
  );
};

export default StoresPage;