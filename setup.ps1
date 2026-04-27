docker-compose up -d db
npm install
npx prisma generate
npx prisma db push --accept-data-loss
node setup-user.js
