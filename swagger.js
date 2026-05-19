import swaggerAutogen from 'swagger-autogen'
import fs from 'fs'

const swaggerAutogenerator = swaggerAutogen()

const doc = {
  info: {
    title: 'Fit Life Sutra API',
    description: 'API documentation for Fit Life Sutra',
  },
  host: 'localhost:3000',
  tags: [
    { name: 'Users', description: 'User management and authentication' },
    { name: 'Attendance', description: 'Attendance tracking' },
    { name: 'Blogs', description: 'Blog management' },
    { name: 'Health Evaluations', description: 'Health evaluation records' },
    { name: 'Inquiry', description: 'User inquiries' },
    { name: 'Testimonials', description: 'User testimonials' }
  ]
};

const outputFile = './swagger-output.json';
const routes = ['./index.js'];

swaggerAutogenerator(outputFile, routes, doc).then(() => {
  const output = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
  for (const path in output.paths) {
    for (const method in output.paths[path]) {
      if (path.includes('/users')) {
        output.paths[path][method].tags = ['Users'];
      } else if (path.includes('/attendance')) {
        output.paths[path][method].tags = ['Attendance'];
      } else if (path.includes('/blogs')) {
        output.paths[path][method].tags = ['Blogs'];
      } else if (path.includes('/healthEvaluations')) {
        output.paths[path][method].tags = ['Health Evaluations'];
      } else if (path.includes('/inquiry')) {
        output.paths[path][method].tags = ['Inquiry'];
      } else if (path.includes('/testimonials')) {
        output.paths[path][method].tags = ['Testimonials'];
      }
    }
  }
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
});