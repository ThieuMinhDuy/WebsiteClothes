import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Spin } from 'antd';
import { Link } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';
import { getCollections } from '../../services/api/productApi';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const CollectionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const collectionsData = await getCollections();
        setCollections(collectionsData);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu bộ sưu tập:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <Title style={{ fontSize: '36px', fontWeight: '600' }}>BỘ SƯU TẬP</Title>
        <Paragraph style={{ fontSize: '16px', maxWidth: '800px', margin: '0 auto' }}>
          Khám phá các bộ sưu tập độc đáo của chúng tôi, mỗi bộ sưu tập là một câu chuyện thời trang riêng biệt.
        </Paragraph>
      </div>

      <Row gutter={[32, 48]}>
        {collections.map((collection, index) => (
          <Col xs={24} md={12} key={collection.id}>
            <Card
              hoverable
              style={{ height: '100%', borderRadius: '8px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
              cover={
                <div style={{ height: '350px', overflow: 'hidden', position: 'relative' }}>
                  <img
                    alt={collection.name}
                    src={collection.image}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'all 0.5s ease'
                    }}
                  />
                  <div style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 50%)',
                    zIndex: 1
                  }} />
                </div>
              }
              bodyStyle={{ padding: '24px' }}
            >
              <Meta
                title={<Title level={3} style={{ margin: 0, marginBottom: '16px' }}>{collection.name}</Title>}
                description={
                  <>
                    <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
                      {collection.description}
                    </Paragraph>
                    <Link to={`/collections/${collection.id}`}>
                      <Button 
                        type="primary" 
                        size="large"
                        style={{ 
                          backgroundColor: '#000', 
                          borderColor: '#000',
                          borderRadius: '0'
                        }}
                      >
                        Xem bộ sưu tập <ArrowRightOutlined />
                      </Button>
                    </Link>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CollectionsPage; 