import React, { useRef, useEffect, useState } from 'react';
import './Testing.css';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

const Testing = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const imageElement = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [fileName, setFileName] = useState('');
  const cropper = useRef(null);
  const [cropVisible, setCropVisible] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);

  const initializeCropper = () => {
    if (cropper.current) {
      cropper.current.destroy();
    }

    cropper.current = new Cropper(imageElement.current, {
      aspectRatio: aspectRatio || NaN,
      viewMode: 1,
    });
    setCropVisible(true);
  };

  useEffect(() => {
    if (imageElement.current && imageSrc) {
      imageElement.current.onload = initializeCropper;
      imageElement.current.src = imageSrc;
    }

    return () => {
      if (cropper.current) {
        cropper.current.destroy();
        cropper.current = null;
      }
    };
  }, [imageSrc, aspectRatio]);

  const handleCrop = () => {
    const canvas = cropper.current.getCroppedCanvas();
    if (canvas) {
      const croppedImageUrl = canvas.toDataURL('image/png');
      setCroppedImage(croppedImageUrl);
      setCropVisible(false);
    }
  };

  const handleTakePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    const imageUrl = canvasRef.current.toDataURL('image/png');
    setOriginalImage(imageUrl); // Set the original image
    setImageSrc(imageUrl);
    setCameraVisible(false);
    setCroppedImage(null);
    setCropVisible(false);

    // Stop the video stream
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    videoRef.current.srcObject = null;
  };

  const openCamera = () => {
    setCameraVisible(true);
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch(err => {
        console.error("Error accessing the camera: ", err);
      });
  };

  const handleSubmit = () => {
    if (croppedImage) {
      alert(`Image ${fileName} submitted.`);
      // Further logic such as sending the cropped image to a server
    } else {
      alert('Please crop the image first.');
    }
  };

  const handleAspectRatioChange = (event) => {
    setAspectRatio(event.target.value);
  };

  return (
    <>
      <section className="ImageCropTestingPageSection">
        <div className="container">
          <div className="row">
            <div className="col-md-12 col-sm-12 col-xs-12">
              <div className='ImageCropTestingBox'>
                <h2>Take Photo</h2>
                <button className='' onClick={openCamera}>Open Camera</button>
                {cameraVisible && (
                  <div className='camera-box'>
                    <video ref={videoRef} width="100%" height="auto" autoPlay></video>
                    <button onClick={handleTakePhoto}>Take Photo</button>
                  </div>
                )}
                {originalImage && (
                  <div className='original-image-box'>
                    <img src={originalImage} alt="Original" />
                  </div>
                )}
                {imageSrc && !croppedImage && (
                  <div className='image-preview-box'>
                    <div>
                      <img ref={imageElement} alt="Preview" style={{ display: 'block' }} />
                    </div>
                    {cropVisible && <button onClick={handleCrop} className='CropImageBtn'>Crop Image</button>}
                  </div>
                )}
                {croppedImage && (
                  <div className='croppedImagePreviewBox'>
                    <h3>Preview</h3>
                    <img src={croppedImage} alt="Cropped" />
                    <p>{fileName}</p>
                    <button onClick={handleSubmit} className='SubmitBtn'>Submit</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480"></canvas>
    </>
  );
};

export default Testing;
