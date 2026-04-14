import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container, Row, Col, Navbar, Nav, Dropdown } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import "../../CSS/Header.css";

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [greeting, setGreeting] = useState("");
  const location = useLocation();

  const updateGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) {
      setGreeting("Chào buổi sáng");
    } else if (hour >= 11 && hour < 13) {
      setGreeting("Chào buổi trưa");
    } else if (hour < 18) {
      setGreeting("Chào buổi chiều");
    } else {
      setGreeting("Chào buổi tối");
    }
  };

  useEffect(() => {
    updateGreeting();
  }, [location.pathname]);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
  };

  const isActive = (path) => location.pathname === path ? 'active-tab' : '';

  return (
    <>
      <div className="header-container">
        <Container fluid className="bg-black" style={{ padding: "4px 0" }}>
          <Row>
            <Col className="Sig">
            {isAuthenticated && user ? (
              <>
                <Link to={`/profile/${user.id}`} className="text-decoration-none">
                  <span className="fancy-font">
                    {greeting}, {user.full_name || user.email}!
                  </span>
                </Link>
                <Link
                  to="#"
                  onClick={handleLogout}
                  className="text-decoration-none"
                  title="Đăng xuất"
                >
                  <i className="bi bi-box-arrow-right"></i>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-decoration-none">
                  Đăng Nhập
                </Link>
                <Link to="/login" className="text-decoration-none">
                  Đăng Ký
                </Link>
              </>
            )}
          </Col>
        </Row>
      </Container>

      <Navbar
        expand="lg"
        className="navbar"
      >
        <Container>
          <Navbar.Brand
            as={Link}
            to={"/"}
            className="d-flex align-items-center nav-image"
          >
            <img src="../assets/Logo/black_on_trans.png" alt="Movie 88" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="custom-nav">
              <Nav.Link
                as={Link}
                to="/showtime"
                className={isActive("/showtime")}
              >
                Lịch Chiếu Theo Rạp
              </Nav.Link>
              <Nav.Link
                as={Link}
                to={"/movie"}
                className={isActive("/movie")}
              >
                Phim
              </Nav.Link>
              <Nav.Link
                as={Link}
                to={"/info"}
                className={isActive("/info")}
              >
                Rạp
              </Nav.Link>
              <Nav.Link
                as={Link}
                to={"/price"}
                className={isActive("/price")}
              >
                Giá Vé
              </Nav.Link>
              {user?.role?.toString() === "1" && (
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    id="dropdown-management"
                    className="nav-link"
                  >
                    Quản Lý
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item
                      as={Link}
                      to="/account"
                      className={isActive("/account")}
                    >
                      Quản Lý Tài Khoản
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/managermovies"
                      className={isActive("/managermovies")}
                    >
                      Quản Lý Phim
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/languages"
                      className={isActive("/languages")}
                    >
                      Quản Lý Ngôn Ngữ
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/genres"
                      className={isActive("/genres")}
                    >
                      Quản Lý Thể Loại
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/movietypes"
                      className={isActive("/movietypes")}
                    >
                      Quản Lý Loại Phim
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/screens"
                      className={isActive("/screens")}
                    >
                      Quản Lý Màn Hình
                    </Dropdown.Item>
                    <Dropdown.Item
                      as={Link}
                      to="/tickets"
                      className={isActive("/tickets")}
                    >
                      Quản Lý Vé
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      </div>
    </>
  );
}

export default Header;
