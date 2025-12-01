# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of our Chess application seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do NOT:

- Open a public GitHub issue
- Discuss the vulnerability in public forums, social media, or other public channels

### Please DO:

1. **Report via GitHub Security Advisories** (Preferred)
   - Navigate to the Security tab of this repository
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Report via Email** (Alternative)
   - Email details to the repository maintainers
   - Use a descriptive subject line like "Security Vulnerability in Chess App"

### What to include in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to expect:

- **Initial Response**: Within 48 hours, we'll acknowledge receipt of your report
- **Status Updates**: We'll keep you informed of our progress
- **Verification**: We'll work with you to understand and verify the issue
- **Fix Development**: We'll develop and test a fix
- **Disclosure**: We'll coordinate public disclosure timing with you

### Disclosure Policy

- We ask that you give us reasonable time to fix the issue before public disclosure
- We will credit you in the security advisory (unless you prefer to remain anonymous)
- We will publicly disclose the vulnerability once a fix is available

## Security Best Practices for Contributors

When contributing to this project:

1. **Dependencies**: Keep dependencies up to date
2. **Secrets**: Never commit API keys, passwords, or other secrets
3. **Input Validation**: Always validate and sanitize user input
4. **Authentication**: Use secure authentication mechanisms
5. **Data Storage**: Encrypt sensitive data at rest and in transit
6. **Code Review**: All code must be reviewed before merging

## Security-Related Configuration

### Environment Variables

Sensitive configuration should be stored in environment variables, never in code:

```
# Mobile App (.env)
API_KEY=your_api_key
API_URL=your_api_url

# Web App (.env.local)
NEXT_PUBLIC_API_URL=your_api_url
DATABASE_URL=your_database_url
```

### Dependency Security

We use:
- Dependabot for automated dependency updates
- npm audit for vulnerability scanning
- Regular security audits of third-party packages

## Known Security Considerations

### Mobile App
- Secure storage using expo-secure-store for sensitive data
- HTTPS enforced for all API communications
- Regular security updates via Expo

### Web App
- HTTPS enforced in production
- Secure session management
- CSRF protection
- XSS prevention through proper input sanitization

## Security Updates

Security updates will be:
- Released as soon as possible after a vulnerability is confirmed
- Announced in the repository's releases section
- Applied to all supported versions when applicable

## Questions?

If you have questions about this security policy, please open a discussion in the repository's Discussions section (for general questions) or contact the maintainers directly (for security-related concerns).

Thank you for helping keep Chess and our users safe!
