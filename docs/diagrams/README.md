# UML Diagrams

This directory contains automatically generated UML diagrams for the codebase.

## Class Diagram

The `class-diagram.png` file shows the relationships between the main classes in the application:

- Core abstracts and interfaces
- Controllers
- Services
- Repositories

The diagram is automatically generated using GitHub Actions whenever changes are pushed to the main branches or when the workflow is manually triggered.

## Viewing the Diagrams

The PNG files can be viewed directly in GitHub or any image viewer. The source PlantUML files (`.puml`) can be edited and rendered using the PlantUML tool or online editors like [PlantUML Web Server](https://www.plantuml.com/plantuml/uml/).

## Architecture Overview

The application follows Clean Architecture principles with a clear separation of concerns:

1. **Core Layer**: Contains abstracts, interfaces, and domain entities
2. **Controllers**: Handle HTTP requests and responses
3. **Services**: Implement business logic and validation
4. **Repositories**: Handle data access and persistence

The UML diagrams help visualize these relationships and dependencies. 