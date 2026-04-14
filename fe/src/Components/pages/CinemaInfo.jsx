import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../../CSS/CinemaInfo.css";
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaClock, 
  FaInfoCircle,
  FaWifi,
  FaCar,
  FaBus,
  FaParking,
  FaTicketAlt,
  FaUtensils,
  FaGift,
  FaSnowflake,
  FaCouch,
  FaVideo,
  FaBuilding
} from "react-icons/fa";

function CinemaInfo() {
  const [cinema, setCinema] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/cinema/1')
      .then((response) => response.json())
      .then((data) => {
        setCinema(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu rạp:", error);
        setLoading(false);
      });
  }, []);

  const amenities = [
    { icon: <FaWifi />, title: "WiFi Miễn Phí", description: "Kết nối internet tốc độ cao" },
    { icon: <FaSnowflake />, title: "Điều Hòa", description: "Hệ thống điều hòa hiện đại" },
    { icon: <FaCouch />, title: "Ghế VIP", description: "Ghế ngồi thoải mái, rộng rãi" },
    { icon: <FaVideo />, title: "Màn Hình 4K", description: "Chất lượng hình ảnh sắc nét" },
    { icon: <FaUtensils />, title: "Quầy Bán Đồ Ăn", description: "Bỏng ngô, nước ngọt, snack" },
    { icon: <FaGift />, title: "Quà Lưu Niệm", description: "Đồ lưu niệm độc đáo" },
  ];

  const transportOptions = [
    { icon: <FaCar />, title: "Xe Ô Tô", description: "Có bãi đỗ xe rộng rãi, miễn phí" },
    { icon: <FaBus />, title: "Xe Bus", description: "Tuyến số 01, 05, 12, 20" },
    { icon: <FaParking />, title: "Xe Máy", description: "Bãi giữ xe an toàn, có bảo vệ" },
  ];

  const screens = [
    { name: "Phòng Chiếu Số 1", capacity: "200 ghế", type: "2D/3D" },
    { name: "Phòng Chiếu Số 2", capacity: "180 ghế", type: "2D/3D" },
    { name: "Phòng Chiếu Số 3", capacity: "150 ghế", type: "2D/3D" },
    { name: "Phòng Chiếu VIP", capacity: "50 ghế", type: "VIP Premium" },
  ];

  if (loading) {
    return (
      <div className="cinema-info-page">
        <Container>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin rạp...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!cinema) {
    return (
      <div className="cinema-info-page">
        <Container>
          <div className="error-state">
            <p>Không thể tải thông tin rạp. Vui lòng thử lại sau.</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="cinema-info-page">
      <Container>
        <div className="cinema-header">
          <h1 className="cinema-name">{cinema.name}</h1>
          <p className="cinema-tagline">Rạp chiếu phim hiện đại với chất lượng tốt nhất</p>
        </div>

        <Row className="cinema-content">
          <Col lg={10} className="mx-auto">
            <div className="info-section">
              {/* Thông Tin Liên Hệ */}
              <div className="info-card">
                <div className="info-card-header">
                  <FaInfoCircle className="info-icon" />
                  <h2>Thông Tin Liên Hệ</h2>
                </div>
                <div className="info-card-body">
                  <div className="info-grid">
                    <div className="info-item">
                      <FaMapMarkerAlt className="info-item-icon" />
                      <div className="info-item-content">
                        <h3>Địa chỉ</h3>
                        <p>{cinema.address}</p>
                      </div>
                    </div>
                    <div className="info-item">
                      <FaPhone className="info-item-icon" />
                      <div className="info-item-content">
                        <h3>Số điện thoại</h3>
                        <a href={`tel:${cinema.contact?.phone}`} className="contact-link">
                          {cinema.contact?.phone}
                        </a>
                      </div>
                    </div>
                    <div className="info-item">
                      <FaEnvelope className="info-item-icon" />
                      <div className="info-item-content">
                        <h3>Email</h3>
                        <a href={`mailto:${cinema.contact?.email}`} className="contact-link">
                          {cinema.contact?.email}
                        </a>
                      </div>
                    </div>
                    <div className="info-item">
                      <FaClock className="info-item-icon" />
                      <div className="info-item-content">
                        <h3>Giờ Mở Cửa</h3>
                        <p>Thứ 2 - Chủ Nhật: 09:00 - 23:00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Giới Thiệu */}
              {cinema.description && (
                <div className="info-card">
                  <div className="info-card-header">
                    <FaInfoCircle className="info-icon" />
                    <h2>Giới Thiệu</h2>
                  </div>
                  <div className="info-card-body">
                    <p className="description-text">{cinema.description}</p>
                  </div>
                </div>
              )}

              {/* Tiện Ích */}
              <div className="info-card">
                <div className="info-card-header">
                  <FaTicketAlt className="info-icon" />
                  <h2>Tiện Ích & Dịch Vụ</h2>
                </div>
                <div className="info-card-body">
                  <Row>
                    {amenities.map((amenity, index) => (
                      <Col md={4} sm={6} key={index}>
                        <div className="amenity-item">
                          <div className="amenity-icon">{amenity.icon}</div>
                          <h4>{amenity.title}</h4>
                          <p>{amenity.description}</p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>

              {/* Phương Tiện Đi Lại */}
              <div className="info-card">
                <div className="info-card-header">
                  <FaCar className="info-icon" />
                  <h2>Phương Tiện Đi Lại</h2>
                </div>
                <div className="info-card-body">
                  <Row>
                    {transportOptions.map((transport, index) => (
                      <Col md={4} key={index}>
                        <div className="transport-item">
                          <div className="transport-icon">{transport.icon}</div>
                          <h4>{transport.title}</h4>
                          <p>{transport.description}</p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>

              {/* Phòng Chiếu */}
              <div className="info-card">
                <div className="info-card-header">
                  <FaBuilding className="info-icon" />
                  <h2>Phòng Chiếu</h2>
                </div>
                <div className="info-card-body">
                  <Row>
                    {screens.map((screen, index) => (
                      <Col md={6} key={index}>
                        <div className="screen-item">
                          <h4>{screen.name}</h4>
                          <div className="screen-details">
                            <span className="screen-capacity">{screen.capacity}</span>
                            <span className="screen-type">{screen.type}</span>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default CinemaInfo;
