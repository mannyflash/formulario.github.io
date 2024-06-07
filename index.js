const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const sql = require('mssql');

// Configuración de conexión a SQL Server
const config = {
    user: 'sa',
    password: 'HALOsun123',
    server: 'LAPTOP-DEL-INGE\\MANNY',
    database: 'ITSPP',
    options: {
        enableArithAbort: true,
        encrypt: true,
        trustServerCertificate: true
    }
};

// Crear pool de conexiones
sql.connect(config)
    .then(pool => {
        console.log('Conexión exitosa a la base de datos');
    })
    .catch(err => {
        console.error('Error de conexión:', err);
    });

// Función para servir archivos estáticos
function serveStaticFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

// Crear servidor HTTP
http.createServer((req, res) => {
    const q = url.parse(req.url, true);
    const filePath = path.join(__dirname, q.pathname === '/' ? 'index.html' : q.pathname);

    if (q.pathname === '/') {
        serveStaticFile(res, filePath, 'text/html');
    } else if (q.pathname === '/styles.css') {
        serveStaticFile(res, filePath, 'text/css');
    } else if (q.pathname === '/registrar' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const formData = new URLSearchParams(body);
            const nombre = formData.get('nombre');
            const apellido = formData.get('apellido');
            const edad = formData.get('edad');
            const telefono = formData.get('telefono');
            const request = new sql.Request();
            request.query(`INSERT INTO Usuarios (Nombre, Apellido, Edad, Telefono) VALUES ('${nombre}', '${apellido}', ${edad}, '${telefono}')`)
                .then(result => {
                    console.log('Registro exitoso');
                    res.writeHead(302, { 'Location': '/' });
                    res.end();
                })
                .catch(err => {
                    console.error('Error al insertar en la base de datos:', err);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error interno del servidor');
                });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
}).listen(3000, '0.0.0.0', () => {
    console.log('Servidor iniciado en http://192.168.0.12:3000/');
});
