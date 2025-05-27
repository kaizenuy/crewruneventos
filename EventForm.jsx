import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../../contexts/EventContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

function EventForm() {
  const { currentEvent, updateEvent, updateFlyer } = useEvent();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: currentEvent?.title || '',
    date: currentEvent?.date ? new Date(currentEvent.date).toISOString().split('T')[0] : '',
    time: currentEvent?.time || '',
    location: currentEvent?.location || '',
    mapUrl: currentEvent?.mapUrl || '',
    description: currentEvent?.description || ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(currentEvent?.imageUrl || '');
  const [imageFile, setImageFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.title || !formData.date || !formData.time) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Handle image upload if there's a new image
      let imageUrl = currentEvent?.imageUrl || '';
      if (imageFile) {
        // In a real application, we would upload the image to a server
        // For this demo, we'll just use the data URL
        imageUrl = imagePreview;
      }
      
      // Update event data
      await updateEvent({
        ...formData,
        imageUrl,
        lastUpdated: new Date().toISOString()
      });
      
      navigate('/admin');
    } catch (err) {
      setError('Error al guardar el evento. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">
        {currentEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <Input
            label="Título del evento *"
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha *"
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Hora *"
              id="time"
              name="time"
              type="text"
              value={formData.time}
              onChange={handleChange}
              placeholder="Ej: 19:00"
              required
            />
          </div>
          
          <Input
            label="Ubicación"
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
          />
          
          <Input
            label="URL del mapa (Google Maps)"
            id="mapUrl"
            name="mapUrl"
            type="text"
            value={formData.mapUrl}
            onChange={handleChange}
            placeholder="https://maps.google.com/..."
          />
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción del evento
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flyer del evento
            </label>
            
            <div className="mt-1 flex items-center">
              <Button
                type="button"
                className="bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                onClick={() => fileInputRef.current.click()}
              >
                Cambiar imagen
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            
            {imagePreview && (
              <div className="mt-4 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-auto max-h-64 rounded-md"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  onClick={() => {
                    setImagePreview('');
                    setImageFile(null);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            className="border border-gray-300 px-6 py-2 rounded-md"
            onClick={() => navigate('/admin')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-black text-white px-6 py-2 rounded-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar evento'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EventForm;