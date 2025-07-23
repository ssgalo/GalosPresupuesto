CREATE TABLE gastos (
    id SERIAL PRIMARY KEY,
    gasto VARCHAR(255) NOT NULL,
    monto NUMERIC(10, 2) NOT NULL,
    categoria VARCHAR(100),
    medio_pago VARCHAR(50),
    mes INTEGER NOT NULL,
    year INTEGER NOT NULL,
    cuota_actual INTEGER DEFAULT 1,
    cuotas_totales INTEGER DEFAULT 1,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opcional: Insertar algunos datos de ejemplo
INSERT INTO gastos (gasto, monto, categoria, medio_pago, mes, year, cuota_actual, cuotas_totales) VALUES
('Supermercado', 150.50, 'Comida', 'Tarjeta', 7, 2024, 1, 1),
('Alquiler', 800.00, 'Vivienda', 'Efectivo', 7, 2024, 1, 1),
('Zapatillas', 120.00, 'Ropa', 'Tarjeta', 7, 2024, 1, 3);