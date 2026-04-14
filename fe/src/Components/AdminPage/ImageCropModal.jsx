import React, { useState, useRef, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageCropModal = ({ show, onClose, imageSrc, onCropComplete, aspectRatio = null, targetWidth = null, targetHeight = null }) => {
  const [crop, setCrop] = useState({ unit: "%", width: 95, aspect: aspectRatio });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const onImageLoaded = useCallback((e) => {
    // Set crop to cover most of the image with fixed aspect ratio
    // Tăng kích thước crop mặc định lên 95% để bao phủ gần hết ảnh
    const cropWidth = 95;
    const cropHeight = aspectRatio ? cropWidth / aspectRatio : cropWidth;
    
    // Tính toán vị trí để căn giữa crop
    const x = (100 - cropWidth) / 2;
    const y = (100 - cropHeight) / 2;
    
    setCrop({
      unit: "%",
      width: cropWidth,
      height: cropHeight,
      aspect: aspectRatio,
      x: x,
      y: y,
    });
  }, [aspectRatio]);

  const getCroppedImg = useCallback(() => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) {
      return null;
    }

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");

    // Tính toán kích thước cuối cùng
    let finalWidth = crop.width * scaleX;
    let finalHeight = crop.height * scaleY;

    // Nếu có targetWidth và targetHeight, resize về kích thước đó
    if (targetWidth && targetHeight) {
      finalWidth = targetWidth;
      finalHeight = targetHeight;
    }

    const pixelRatio = window.devicePixelRatio;
    canvas.width = finalWidth * pixelRatio;
    canvas.height = finalHeight * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;

    // Vẽ ảnh đã crop và resize về kích thước mục tiêu
    ctx.drawImage(
      image,
      cropX,
      cropY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      finalWidth,
      finalHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        0.95
      );
    });
  }, [completedCrop, targetWidth, targetHeight]);

  const handleCropComplete = async () => {
    const croppedImageBlob = await getCroppedImg();
    if (croppedImageBlob) {
      onCropComplete(croppedImageBlob);
      onClose();
      // Reset state
      setCrop({ unit: "%", width: 95, aspect: aspectRatio });
      setCompletedCrop(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setCrop({ unit: "%", width: 95, aspect: aspectRatio });
    setCompletedCrop(null);
  };

  return (
    <Modal show={show} onHide={handleCancel} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Cắt ảnh</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem" }}>
        {imageSrc && (
          <div style={{ width: "100%", maxWidth: "900px" }}>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              minWidth={100}
              minHeight={aspectRatio ? 100 / aspectRatio : 100}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imageSrc}
                style={{ maxWidth: "100%", maxHeight: "700px", display: "block" }}
                onLoad={onImageLoaded}
              />
            </ReactCrop>
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{
            display: "none",
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleCropComplete} disabled={!completedCrop}>
          Xác nhận
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageCropModal;
