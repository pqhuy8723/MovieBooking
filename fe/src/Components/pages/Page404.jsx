import React from "react";
import { Link } from "react-router-dom";
import "../../CSS/Nike.css";

function Page404() {
  return (
    <div className="nike-404">
      <h1>404</h1>
      <p>Trang bạn tìm kiếm không tồn tại.</p>
      <Link to="/" className="btn-nike-primary">
        Về trang chủ
      </Link>
    </div>
  );
}

export default Page404;
