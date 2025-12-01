# Contributing to Chess

Thank you for your interest in contributing to our Chess project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/chess.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit and push
7. Create a Pull Request

## Development Setup

### Mobile App

```bash
cd apps/mobile
npm install
npm start
```

### Web App

```bash
cd apps/web
npm install
npm run dev
```

## How to Contribute

### Reporting Bugs

- Use the bug report template when creating an issue
- Include detailed steps to reproduce
- Provide environment information
- Add screenshots if applicable

### Suggesting Features

- Use the feature request template
- Clearly describe the problem and proposed solution
- Explain why this feature would be useful

### Code Contributions

1. Check existing issues and PRs to avoid duplicates
2. Discuss major changes in an issue first
3. Write clear, commented code
4. Follow our coding standards
5. Add or update tests as needed
6. Update documentation if needed

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for type safety
- Follow ESLint configuration
- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused

### React/React Native

- Use functional components with hooks
- Follow React best practices
- Keep components small and reusable
- Use proper prop types

### File Organization

- Group related files together
- Use clear, descriptive file names
- Follow the existing project structure

## Commit Guidelines

We follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(mobile): add chess move validation
fix(web): resolve board rendering issue
docs: update installation instructions
```

## Pull Request Process

1. **Update Documentation**: Ensure documentation reflects your changes
2. **Add Tests**: Include tests for new features or bug fixes
3. **Follow Template**: Fill out the PR template completely
4. **Code Review**: Address review comments promptly
5. **Keep Updated**: Rebase on main if needed
6. **Pass CI**: Ensure all CI checks pass

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass locally

## Questions?

Feel free to ask questions in:
- GitHub Discussions
- Issue comments
- Pull Request comments

Thank you for contributing to Chess!
