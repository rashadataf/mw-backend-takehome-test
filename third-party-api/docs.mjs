import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fastify from 'fastify';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pathToServeSwaggerUI = 'docs';

const swaggerUIAppForFile = (swaggerSpecPathRelativeToThisFile) => {
    const app = fastify();
    app
        .register(import('@fastify/swagger'), {
            mode: 'static',
            specification: {
                path: resolve(__dirname, swaggerSpecPathRelativeToThisFile),
            }
        })
        .register(import('@fastify/swagger-ui'), {
            routePrefix: pathToServeSwaggerUI,
        })
        .ready();
    return app;
}

const specifications = [{
    relativePath: './SuperCar/supercar-valuations-0.1-swagger.yaml',
    port: 3001,
}, {
    relativePath: './Premium Car/premium-car-valuations-0.1-swagger.yaml',
    port: 3002,
}];

specifications.forEach(({ relativePath, port }) => {
    swaggerUIAppForFile(relativePath).listen({ port });
    console.log(`Serving Swagger UI for ${relativePath} at http://localhost:${port}/${pathToServeSwaggerUI}`);
});