// src/ImageCropper.js

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Crop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropper = () => {
    const [images, setImages] = useState([]);
    const [crop, setCrop] = useState({ unit: '%', width: 30, height: 30 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [error, setError] = useState('');

    const onDrop = (acceptedFiles) => {
        setError(''); // Reset any previous error
        const filePreviews = acceptedFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        if (filePreviews.length + images.length > 5) {
            setError('You can only upload up to 5 images.');
            return;
        }

        setImages((prev) => [...prev, ...filePreviews]);
    };

    const handleCrop = () => {
        if (!completedCrop || !imageSrc) return;

        const canvas = document.createElement('canvas');
        const scaleX = completedCrop.width / completedCrop.naturalWidth;
        const scaleY = completedCrop.height / completedCrop.naturalHeight;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;

        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            ctx.drawImage(
                img,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                completedCrop.width,
                completedCrop.height
            );

            const croppedImageUrl = canvas.toDataURL();
            console.log('Cropped Image URL:', croppedImageUrl);
            alert('Cropped image saved! Check the console for the data URL.');
        };
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*', // Accept only image files
    });

    return (
        <div>
            <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div>
                {images.map((image, index) => (
                    <div key={index} style={{ margin: '20px', display: 'inline-block' }}>
                        <img src={image.preview} alt={`preview-${index}`} style={{ maxWidth: '100px' }} />
                        <button onClick={() => {
                            setImageSrc(image.preview);
                            setCurrentImageIndex(index);
                            setCompletedCrop(null); // Reset crop state when selecting a new image
                        }}>Crop</button>
                    </div>
                ))}
            </div>

            {imageSrc && (
                <div>
                    <Crop
                        src={imageSrc}
                        crop={crop}
                        onCropChange={setCrop}
                        onComplete={(crop) => setCompletedCrop(crop)}
                    />
                    <button onClick={handleCrop}>Save Crop</button>
                </div>
            )}
        </div>
    );
};

export default ImageCropper;
