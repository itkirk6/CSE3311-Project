FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Expose the port
EXPOSE 3001

# Command to run migrations (if needed), seed, and start dev server
CMD sh -c "if [ -z \"$(ls -A node_modules 2>/dev/null)\" ]; then npm install; fi && npx prisma migrate dev --name init && npm run db:seed && npm run dev"