using System;
using System.ComponentModel.DataAnnotations;

namespace WebServiceAgendaMedicaASMX.Models
{
    /// <summary>
    /// Modelo para la tabla INVENTARIO
    /// </summary>
    [Serializable]
    public class Inventario
    {
        public int InventarioID { get; set; }
        
        public int MedicamentoID { get; set; }
        
        public int CantidadDisponible { get; set; }
        
        public int StockMinimo { get; set; }
        
        [StringLength(50)]
        public string Lote { get; set; }
        
        public DateTime? FechaVencimiento { get; set; }
        
        [StringLength(50)]
        public string Ubicacion { get; set; }
        
        public DateTime FechaCreacion { get; set; }
        
        public DateTime? FechaModificacion { get; set; }
        
        public bool Activo { get; set; }
        
        [StringLength(500)]
        public string Observaciones { get; set; }
        
        // Propiedades de navegación
        public virtual Medicamento Medicamento { get; set; }
        
        // Propiedad calculada para verificar stock bajo
        public bool EsStockBajo
        {
            get { return CantidadDisponible <= StockMinimo; }
        }
        
        public Inventario()
        {
            FechaCreacion = DateTime.Now;
            Activo = true;
            CantidadDisponible = 0;
            StockMinimo = 10; // Valor por defecto
        }
    }
}