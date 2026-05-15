import { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

async function cropToBlob(imgEl, crop) {
  const canvas = document.createElement('canvas');
  const scaleX = imgEl.naturalWidth / imgEl.width;
  const scaleY = imgEl.naturalHeight / imgEl.height;
  canvas.width = Math.round(crop.width * scaleX);
  canvas.height = Math.round(crop.height * scaleY);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    imgEl,
    crop.x * scaleX, crop.y * scaleY,
    crop.width * scaleX, crop.height * scaleY,
    0, 0, canvas.width, canvas.height,
  );
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
}

function CropperModal({ imageSrc, onConfirm, onCancelar }) {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [aplicando, setAplicando] = useState(false);
  const imgRef = useRef(null);

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height),
      width, height,
    ));
  }

  async function handleConfirm() {
    if (!completedCrop || !imgRef.current) return;
    setAplicando(true);
    const blob = await cropToBlob(imgRef.current, completedCrop);
    onConfirm(blob);
  }

  return (
    <div className="modal-overlay modal-overlay--open">
      <div className="modal" style={{ maxWidth: 640 }}>
        <button className="modal__close" onClick={onCancelar}>✕</button>
        <div className="modal__body" style={{ paddingTop: 40 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>Ajustar foto principal</h2>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: 16 }}>
            Mueve y redimensiona el recuadro para recortar la imagen.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', background: '#f9fafb', borderRadius: 10, overflow: 'hidden' }}>
            <ReactCrop
              crop={crop}
              onChange={c => setCrop(c)}
              onComplete={c => setCompletedCrop(c)}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                onLoad={onImageLoad}
                style={{ maxWidth: '100%', maxHeight: 420, display: 'block' }}
                alt="Recortar"
              />
            </ReactCrop>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              className="btn btn--primary"
              style={{ padding: '10px 24px' }}
              onClick={handleConfirm}
              disabled={aplicando || !completedCrop}
            >
              {aplicando ? 'Aplicando…' : '✓ Aplicar recorte'}
            </button>
            <button className="btn btn--outline" style={{ padding: '10px 20px' }} onClick={onCancelar}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CropperModal;
