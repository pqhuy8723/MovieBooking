import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../../CSS/TicketPricing.css';
import { FaTicketAlt, FaUsers, FaChild, FaGraduationCap, FaInfoCircle } from 'react-icons/fa';

function TicketPricing() {
  const [ticketPricing, setTicketPricing] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/ticketPricing')
      .then(response => response.json())
      .then(data => setTicketPricing(data))
      .catch(error => console.error('Lỗi khi tải dữ liệu giá vé:', error));
  }, []);

  const getIconForType = (type) => {
    if (type.includes('Người Lớn') || type.includes('18+')) {
      return <FaUsers className="ticket-icon" />;
    } else if (type.includes('Trẻ Em') || type.includes('Trẻ')) {
      return <FaChild className="ticket-icon" />;
    } else if (type.includes('Sinh Viên') || type.includes('Học Sinh')) {
      return <FaGraduationCap className="ticket-icon" />;
    }
    return <FaTicketAlt className="ticket-icon" />;
  };

  return (
    <div className="ticket-pricing-page">
      <Container>
        <div className="pricing-header">
          <h1 className="page-title">Bảng Giá Vé</h1>
          <p className="page-subtitle">Chọn loại vé phù hợp với bạn</p>
        </div>

        <Row className="ticket-cards">
          {ticketPricing.map(ticket => (
            <Col md={4} key={ticket.id} className="mb-4">
              <div className="ticket-card">
                <div className="ticket-card-header">
                  {getIconForType(ticket.type)}
                  <h3 className="ticket-type">{ticket.type}</h3>
                </div>
                <div className="ticket-price">
                  <span className="price-amount">{ticket.price.toLocaleString()}</span>
                  <span className="price-currency">VNĐ</span>
                </div>
                <div className="ticket-rules">
                  <h4 className="rules-title">
                    <FaInfoCircle /> Quy định
                  </h4>
                  <ul className="rules-list">
                    {ticket.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        <div className="movie-rules-section">
          <h2 className="section-title">
            <FaInfoCircle /> Quy Định Về Phim
          </h2>
          <Row>
            <Col md={4}>
              <div className="rule-card">
                <div className="rule-card-header adult">
                  <FaUsers className="rule-icon" />
                  <h3>Phim cho Người Lớn (18+)</h3>
                </div>
                <p className="rule-description">
                  Những bộ phim có yếu tố bạo lực, kinh dị hoặc chủ đề nhạy cảm. 
                  Không phù hợp cho trẻ em và thanh thiếu niên.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="rule-card">
                <div className="rule-card-header children">
                  <FaChild className="rule-icon" />
                  <h3>Phim cho Trẻ Em</h3>
                </div>
                <p className="rule-description">
                  Các bộ phim hoạt hình, gia đình. Chỉ dành cho trẻ em dưới 12 tuổi.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="rule-card">
                <div className="rule-card-header student">
                  <FaGraduationCap className="rule-icon" />
                  <h3>Phim Sinh Viên / Học Sinh</h3>
                </div>
                <p className="rule-description">
                  Các bộ phim nhẹ nhàng, phù hợp cho học sinh và sinh viên. 
                  Những bộ phim này thường có tính giáo dục cao.
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default TicketPricing;
