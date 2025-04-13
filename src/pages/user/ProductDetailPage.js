import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Typography, Carousel, Card, Button, InputNumber, Select, Tabs, Descriptions, Rate, Divider, message, List, Tag, Tooltip, Collapse, Image } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, CheckOutlined, LeftOutlined, RightOutlined, InfoCircleOutlined, SyncOutlined, CarOutlined, SkinOutlined } from '@ant-design/icons';
import { getProductById, getRelatedProducts } from '../../services/api/productApi';
import { useCart } from '../../contexts/CartContext';
import { Link } from 'react-router-dom';
import React from 'react';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [displayedImages, setDisplayedImages] = useState([]);
  const carouselRef = React.createRef();
  
  // Config cho chức năng zoom ảnh
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  
  const carouselSettings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    effect: 'fade',
  };
  
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productData = await getProductById(id);
        setProduct(productData);
        
        // Thiết lập giá trị mặc định cho size và color
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0]);
        }
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0]);
        }
        
        // Xử lý ảnh sản phẩm theo màu
        if (productData.colorImages) {
          // Nếu sản phẩm có ảnh theo màu, sử dụng ảnh của màu đầu tiên
          const firstColor = productData.colors[0];
          setDisplayedImages(productData.colorImages[firstColor] || productData.images);
        } else {
          // Nếu không có ảnh theo màu, sử dụng ảnh mặc định
          setDisplayedImages(productData.images);
        }
        
        // Lấy các sản phẩm liên quan
        const related = await getRelatedProducts(id, productData.category);
        setRelatedProducts(related);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết sản phẩm:', error);
        message.error('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);
  
  // Cập nhật ảnh hiển thị khi người dùng chọn màu khác
  useEffect(() => {
    if (!product || !selectedColor) return;
    
    if (product.colorImages && product.colorImages[selectedColor]) {
      setDisplayedImages(product.colorImages[selectedColor]);
      // Reset carousel về vị trí đầu tiên khi đổi màu
      if (carouselRef.current) {
        carouselRef.current.goTo(0);
        setCurrentSlide(0);
      }
    } else {
      setDisplayedImages(product.images);
    }
  }, [selectedColor, product]);
  
  if (loading || !product) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải...</div>;
  }
  
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      message.warning('Vui lòng chọn kích thước và màu sắc');
      return;
    }
    
    addToCart(product, quantity, selectedSize, selectedColor);
    message.success(`Đã thêm ${product.name} vào giỏ hàng`);
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const toggleWishlist = () => {
    setIsInWishlist(!isInWishlist);
    message.success(isInWishlist 
      ? `Đã xóa ${product.name} khỏi danh sách yêu thích` 
      : `Đã thêm ${product.name} vào danh sách yêu thích`);
  };
  
  const handleColorChange = (color) => {
    setSelectedColor(color);
  };
  
  const handleZoom = (e, imageElement) => {
    if (!imageElement) return;
    
    const { left, top, width, height } = imageElement.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    setHoverPosition({ x, y });
  };
  
  const arrowButtonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'transparent',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  };

  const arrowButtonHoverStyle = {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
  };

  const arrowButtonActiveStyle = {
    transform: 'scale(0.95)',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)'
  };
  
  // Mô tả chi tiết, thành phần và hướng dẫn bảo quản mẫu
  const materialDescription = (
    <div>
      <p><strong>Thành phần chất liệu:</strong></p>
      <ul>
        <li>Vải chính: 95% Cotton, 5% Spandex</li>
        <li>Được sản xuất từ cotton hữu cơ, an toàn cho làn da nhạy cảm</li>
        <li>Công nghệ chống nhăn và dễ là ủi</li>
        <li>Chất liệu co giãn 4 chiều thoải mái khi vận động</li>
      </ul>
    </div>
  );
  
  const careInstructions = (
    <div>
      <p><strong>Hướng dẫn bảo quản:</strong></p>
      <ul>
        <li>Giặt máy ở nhiệt độ thấp (30°C)</li>
        <li>Không sử dụng chất tẩy có chứa clo</li>
        <li>Sấy khô ở nhiệt độ thấp</li>
        <li>Là ủi ở nhiệt độ trung bình (150°C)</li>
        <li>Không giặt khô</li>
        <li>Lộn trái áo khi giặt để bảo vệ hình in và màu sắc</li>
      </ul>
    </div>
  );
  
  return (
    <div>
      <Row gutter={[32, 32]}>
        {/* Ảnh sản phẩm */}
        <Col xs={24} md={12}>
          <Card>
            <div className="product-image-container" style={{ position: 'relative', overflow: 'hidden' }}>
              <Image.PreviewGroup>
                <Carousel 
                  ref={carouselRef}
                  autoplay={false}
                  afterChange={(current) => setCurrentSlide(current)}
                  effect="fade"
                  speed={500}
                  dots={false}
                >
                  {displayedImages.map((image, index) => (
                    <div key={index} className="product-slide">
                      <div 
                        className="zoom-container"
                        style={{ 
                          position: 'relative',
                          overflow: 'hidden',
                          height: '500px',
                          cursor: 'zoom-in'
                        }}
                      >
                        <Image 
                          src={image || "https://via.placeholder.com/500x500?text=No+Image"} 
                          alt={`${product.name} - Ảnh ${index + 1}`} 
                          preview={{
                            mask: <div style={{ fontSize: '16px' }}>Nhấn để xem phóng to</div>
                          }}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </Carousel>
              </Image.PreviewGroup>
              
              {/* Nút điều hướng trái phải */}
              <div className="carousel-arrows" style={{ position: 'absolute', width: '100%', top: '50%', transform: 'translateY(-50%)', display: 'flex', justifyContent: 'space-between', padding: '0 16px', zIndex: 1 }}>
                <Button 
                  className="carousel-arrow-button carousel-arrow-left"
                  icon={<LeftOutlined />} 
                  onClick={() => carouselRef.current.prev()}
                  style={arrowButtonStyle}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, arrowButtonHoverStyle);
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, arrowButtonStyle);
                  }}
                  onMouseDown={(e) => {
                    Object.assign(e.currentTarget.style, arrowButtonActiveStyle);
                  }}
                  onMouseUp={(e) => {
                    Object.assign(e.currentTarget.style, arrowButtonHoverStyle);
                  }}
                />
                <Button 
                  className="carousel-arrow-button carousel-arrow-right"
                  icon={<RightOutlined />}
                  onClick={() => carouselRef.current.next()}
                  style={arrowButtonStyle}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, arrowButtonHoverStyle);
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, arrowButtonStyle);
                  }}
                  onMouseDown={(e) => {
                    Object.assign(e.currentTarget.style, arrowButtonActiveStyle);
                  }}
                  onMouseUp={(e) => {
                    Object.assign(e.currentTarget.style, arrowButtonHoverStyle);
                  }}
                />
              </div>
              
              {/* Hiển thị điểm tượng trưng cho vị trí slide */}
              <div className="carousel-dots" style={{ textAlign: 'center', marginTop: '10px' }}>
                {displayedImages.map((_, index) => (
                  <span 
                    key={index} 
                    onClick={() => carouselRef.current.goTo(index)}
                    style={{ 
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: currentSlide === index ? '#1890ff' : '#d9d9d9',
                      margin: '0 4px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
              </div>
              
              {/* Hiển thị thumbnail ảnh nhỏ để dễ chọn */}
              <div className="carousel-thumbnails" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                {displayedImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => carouselRef.current.goTo(index)}
                    style={{
                      width: '60px',
                      height: '60px',
                      margin: '0 4px',
                      padding: '2px',
                      border: currentSlide === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      cursor: 'pointer',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={image || "https://via.placeholder.com/60x60?text=No+Image"}
                      alt={`Thumbnail ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
        
        {/* Thông tin sản phẩm */}
        <Col xs={24} md={12}>
          <div style={{ position: 'sticky', top: '20px' }}>
            <Title level={2}>{product.name}</Title>
            <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
              <Rate disabled defaultValue={4.5} /> 
              <Text style={{ marginLeft: '8px' }}>(120 đánh giá)</Text>
              <Divider type="vertical" />
              <Text>Đã bán: 350</Text>
            </div>
            
            {/* Giá và giá giảm */}
            <div style={{ margin: '16px 0' }}>
              <Title level={3} style={{ color: 'red', margin: '0' }}>
                {product.price.toLocaleString('vi-VN')}đ
              </Title>
              
              {product.discount > 0 && product.oldPrice !== product.price && (
                <Text delete type="secondary" style={{ fontSize: '16px', marginLeft: '8px' }}>
                  {product.oldPrice.toLocaleString('vi-VN')}đ
                </Text>
              )}
              
              {product.discount > 0 && (
                <Tag color="red" style={{ marginLeft: '8px' }}>
                  Giảm {product.discount}%
                </Tag>
              )}
            </div>
            
            {/* Mô tả ngắn */}
            <Card style={{ marginBottom: '16px', backgroundColor: '#f5f5f5' }}>
              <Paragraph>{product.description}</Paragraph>
              <div style={{ marginTop: '8px' }}>
                <Tag icon={<SkinOutlined />} color="blue">Chất liệu cao cấp</Tag>
                <Tag icon={<CheckOutlined />} color="green">Bảo hành 30 ngày</Tag>
                <Tag icon={<CarOutlined />} color="gold">Giao hàng miễn phí</Tag>
              </div>
            </Card>
            
            <Divider />
            
            {/* Chọn kích thước */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Kích thước: </Text>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {product.sizes.map(size => (
                  <Button
                    key={size}
                    type={selectedSize === size ? 'primary' : 'default'}
                    onClick={() => setSelectedSize(size)}
                    style={{ minWidth: '50px' }}
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <div style={{ marginTop: '8px' }}>
                <Button type="link" icon={<InfoCircleOutlined />} size="small">
                  Hướng dẫn chọn kích cỡ
                </Button>
              </div>
            </div>
            
            {/* Chọn màu sắc */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Màu sắc: </Text>
              <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {product.colors.map(color => {
                  // Màu mẫu để hiển thị, bạn có thể điều chỉnh theo dữ liệu thực tế
                  const colorMap = {
                    'Đen': '#000000',
                    'Trắng': '#FFFFFF',
                    'Đỏ': '#FF0000',
                    'Xanh': '#0000FF',
                    'Xanh lá': '#00FF00',
                    'Vàng': '#FFFF00',
                    'Cam': '#FFA500',
                    'Tím': '#800080',
                    'Hồng': '#FFC0CB',
                    'Xám': '#808080',
                    'Nâu': '#A52A2A',
                    'Be': '#F5F5DC',
                  };
                  
                  const bgColor = colorMap[color] || '#CCCCCC';
                  
                  return (
                    <Tooltip key={color} title={color}>
                      <div
                        onClick={() => handleColorChange(color)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: bgColor,
                          border: `2px solid ${selectedColor === color ? '#1890ff' : 'transparent'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          boxShadow: selectedColor === color ? '0 0 0 2px rgba(24, 144, 255, 0.2)' : 'none'
                        }}
                      >
                        {selectedColor === color && <CheckOutlined style={{ color: bgColor === '#FFFFFF' ? '#000' : '#fff' }} />}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
            
            {/* Chọn số lượng */}
            <div style={{ marginBottom: 24 }}>
              <Text strong>Số lượng: </Text>
              <InputNumber 
                min={1} 
                max={product.inStock} 
                value={quantity} 
                onChange={setQuantity} 
                style={{ marginLeft: 8 }}
              />
              <Text type="secondary" style={{ marginLeft: 8 }}>
                Còn lại: {product.inStock} sản phẩm
              </Text>
            </div>
            
            {/* Thông tin giao hàng */}
            <Collapse ghost style={{ marginBottom: '16px' }}>
              <Panel header="Thông tin vận chuyển" key="1">
                <p><CarOutlined /> Giao hàng tiêu chuẩn: 1-3 ngày</p>
                <p><SyncOutlined /> Đổi trả trong vòng 30 ngày nếu sản phẩm có lỗi</p>
              </Panel>
            </Collapse>
            
            {/* Nút thêm vào giỏ, mua ngay và yêu thích */}
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<ShoppingCartOutlined />} 
                  onClick={handleAddToCart}
                  block
                >
                  Thêm vào giỏ
                </Button>
              </Col>
              <Col span={12}>
                <Button 
                  danger
                  size="large" 
                  onClick={handleBuyNow}
                  block
                >
                  Mua ngay
                </Button>
              </Col>
              <Col span={24}>
                <Button 
                  type={isInWishlist ? "default" : "dashed"}
                  size="large" 
                  icon={<HeartOutlined style={{ color: isInWishlist ? 'red' : undefined }} />}
                  onClick={toggleWishlist}
                  block
                >
                  {isInWishlist ? 'Đã thêm vào yêu thích' : 'Thêm vào danh sách yêu thích'}
                </Button>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
      
      {/* Tabs thông tin chi tiết */}
      <div style={{ marginTop: 48, backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }}>
        <Tabs defaultActiveKey="1" type="card">
          <TabPane tab="Mô tả chi tiết" key="1">
            <div style={{ padding: '16px' }}>
              <Paragraph>
                {product.description}
                <br /><br />
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </Paragraph>
              <div style={{ marginTop: '16px' }}>
                <img 
                  src={product.images[0]} 
                  alt="Chi tiết sản phẩm" 
                  style={{ maxWidth: '100%', margin: '16px 0' }} 
                />
              </div>
              <Descriptions title="Thông số sản phẩm" bordered>
                <Descriptions.Item label="Tên sản phẩm">{product.name}</Descriptions.Item>
                <Descriptions.Item label="Danh mục">Áo thun</Descriptions.Item>
                <Descriptions.Item label="Kích thước có sẵn">{product.sizes.join(', ')}</Descriptions.Item>
                <Descriptions.Item label="Màu sắc có sẵn">{product.colors.join(', ')}</Descriptions.Item>
                <Descriptions.Item label="Xuất xứ">Việt Nam</Descriptions.Item>
                <Descriptions.Item label="Phong cách">Casual</Descriptions.Item>
              </Descriptions>
            </div>
          </TabPane>
          <TabPane tab="Thành phần chất liệu" key="2">
            <div style={{ padding: '16px' }}>
              {materialDescription}
              <div style={{ marginTop: '24px' }}>
                <Title level={4}>Đặc điểm nổi bật:</Title>
                <ul>
                  <li>Vải cotton cao cấp, mềm mại và thoáng khí</li>
                  <li>Không gây kích ứng da, phù hợp với mọi loại da</li>
                  <li>Độ co giãn tốt, tạo cảm giác thoải mái khi mặc</li>
                  <li>Khả năng thấm hút mồ hôi cao, thích hợp cho các hoạt động hàng ngày</li>
                </ul>
              </div>
            </div>
          </TabPane>
          <TabPane tab="Hướng dẫn bảo quản" key="3">
            <div style={{ padding: '16px' }}>
              {careInstructions}
              <div style={{ marginTop: '24px' }}>
                <Title level={4}>Lưu ý quan trọng:</Title>
                <ul>
                  <li>Không ngâm sản phẩm quá lâu trong nước</li>
                  <li>Phơi trong bóng râm để giữ màu sắc</li>
                  <li>Tránh tiếp xúc với các hóa chất mạnh như thuốc tẩy, xà phòng có tính kiềm cao</li>
                </ul>
              </div>
            </div>
          </TabPane>
          <TabPane tab="Đánh giá" key="4">
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <Title level={2} style={{ marginBottom: '0' }}>4.5/5</Title>
                  <Rate disabled defaultValue={4.5} allowHalf />
                  <div>Dựa trên 120 đánh giá</div>
                </div>
                <div>
                  <Button type="primary">Viết đánh giá</Button>
                </div>
              </div>
              
              <Divider />
              
              {/* Demo đánh giá */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Nguyễn Văn A</Text>
                    <div><Rate disabled defaultValue={5} /></div>
                  </div>
                  <div>2 ngày trước</div>
                </div>
                <Paragraph style={{ marginTop: '8px' }}>
                  Sản phẩm rất tốt, chất lượng vải đẹp, đúng kích cỡ. Giao hàng nhanh, đóng gói cẩn thận.
                </Paragraph>
              </div>
              
              <Divider />
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>Trần Thị B</Text>
                    <div><Rate disabled defaultValue={4} /></div>
                  </div>
                  <div>1 tuần trước</div>
                </div>
                <Paragraph style={{ marginTop: '8px' }}>
                  Áo đẹp, đúng mẫu. Tuy nhiên hơi rộng một chút so với kích cỡ thông thường. Nên đặt nhỏ hơn 1 size.
                </Paragraph>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
      
      {/* Sản phẩm liên quan */}
      <div style={{ marginTop: 48 }}>
        <Title level={3}>Sản phẩm liên quan</Title>
        <Row gutter={[16, 16]}>
          {relatedProducts.map(item => (
            <Col xs={12} sm={8} md={6} key={item.id}>
              <Link to={`/products/${item.id}`}>
                <Card
                  hoverable
                  cover={
                    <img 
                      alt={item.name} 
                      src={item.images[0] || "https://via.placeholder.com/300x300"} 
                      style={{ height: 250, objectFit: 'cover' }}
                    />
                  }
                >
                  <Card.Meta 
                    title={item.name} 
                    description={
                      <div>
                        <div style={{ color: 'red', fontWeight: 'bold' }}>
                          {item.price.toLocaleString('vi-VN')}đ
                        </div>
                        {item.discount > 0 && item.oldPrice !== item.price && (
                          <span style={{ textDecoration: 'line-through', color: '#999', marginLeft: '8px' }}>
                            {item.oldPrice.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ProductDetailPage;
