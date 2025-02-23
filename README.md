# Pixel Place

A real-time collaborative pixel art canvas inspired by r/place, built with modern web technologies. Create pixel art alone, with friends, or join the global canvas.

## Features

### Three Drawing Modes
- 🌍 **Global Canvas**: Join a worldwide collaborative canvas where each pixel placement has a 5-minute cooldown
- 🎨 **Personal Mode**: Create your own pixel art without restrictions
- 👥 **Room Mode**: Create private rooms to collaborate with friends in real-time

### Canvas Features
- 250x250 pixel grid
- Custom color picker
- Quick-access color palette
- Zoom controls (50% - 200%)
- Real-time updates
- Cooldown timer for global mode

## Tech Stack

### Frontend
- **Next.js 15**: React framework for the UI
- **TypeScript**: Type-safe code
- **Tailwind CSS**: Styling and components
- **WebSocket API**: Real-time communication
- **Zustand**: State management

### Backend
- **Node.js**: Runtime environment
- **WebSocket (ws)**: Native WebSocket server
- **Prisma**: Database ORM
- **PostgreSQL**: Database (via Supabase)

## How It Works

- The canvas state is stored in a PostgreSQL database
- Real-time updates are handled through Edge Runtime WebSockets
- Changes are instantly broadcasted to all connected users
- Global mode enforces a 5-minute cooldown between pixel placements
- Room mode creates isolated canvases for private collaboration
- Personal mode stores pixels locally for individual creation

## Contributing

Contributions to the project are welcome!

### Ways to Contribute
- 🐛 Report bugs and issues
- 💡 Suggest new features or improvements
- 🎨 Improve the UI/UX design
- 📝 Update documentation
- 💻 Submit pull requests

### Development Setup
1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/jaskeensingh/pixel-place.git
```
3. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```
4. Make your changes
5. Test your changes
6. Push to your fork and submit a pull request

### Good First Issues
- Improve mobile responsiveness
- Add canvas export feature
- Implement user authentication

### Pull Request Process
1. Update the README.md with details of changes if needed
4. Link any relevant issues in your PR description

### Questions?
Feel free to open an issue for discussion or reach out to the maintainers.

### Code of Conduct
Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

## License

MIT License - feel free to use this project however you'd like.

