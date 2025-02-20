# eFootball Tournament Manager

A web application for creating and managing eFootball tournaments with features for tournament brackets, team management, and match scheduling.

## Features

- Create and manage eFootball tournaments
- Multiple tournament formats (League, Knockout, Groups)
- Team registration and management
- Match scheduling and result tracking
- Responsive design with Tailwind CSS
- MongoDB database integration

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, Tailwind CSS
- **Database**: MongoDB
- **Authentication**: Coming soon

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v14 or higher)
- MongoDB
- npm (Node Package Manager)

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/efootball-tournament.git
cd efootball-tournament
```

2. Install dependencies
```bash
npm install
```

3. Create a .env file in the root directory
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

4. Build CSS
```bash
npm run build:css
```

5. Start the development server
```bash
npm start
```

## Project Structure

```plaintext
efootball-tournament/
├── config/
│   └── db.js
├── models/
│   └── Tournament.js
├── public/
│   ├── css/
│   └── dist/
├── routes/
│   └── tournamentRoutes.js
├── views/
│   ├── components/
│   ├── layouts/
│   ├── partials/
│   └── tournaments/
├── .env
├── .gitignore
├── index.js
└── package.json
```

## Available Scripts

- `npm start`: Starts the development server
- `npm run build:css`: Builds and watches Tailwind CSS
- `npm test`: Runs tests (to be implemented)

## Environment Variables

| Variable   | Description                  | Default |
|-----------|------------------------------|---------|
| MONGO_URI | MongoDB connection string    | -       |
| PORT      | Port for the Express server | 5000    |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)

## Contact

Your Name - JuneMoeNyiNyi

Project Link: [https://github.com/yourusername/efootball-tournament](https://github.com/JuneICT/efootball-tournament)
