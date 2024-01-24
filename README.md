
# Table of Contents
1. [Installation](#Installation)
2. [Technology Selection](#Technical-overview)

# Installation
To install this project, please follow the steps below:

## Prerequisites

1. **.NET Core SDK:**
   - Ensure that you have the [.NET Core SDK](https://dotnet.microsoft.com/download) installed on your machine. The application should be compatible with the version specified in the repository.

2. **Git:**
   - Make sure you have [Git](https://git-scm.com/) installed to clone the repository.

## Installation Steps
1. Clone the Repository
2. Navigate to the Web Directory
    - ```cd WebApp```
3. Build the Application
    - ```dotnet build```
    - This command compiles the application and resolves dependencies, including those specified in `libman.json`.
4. Run the Application
   - ```dotnet run```
5. Access the Application
   - Once the application is running, open your web browser and navigate to http://localhost:5000 (see step 4. exact url `Now listening on`).

# Technical Overview

## Technology Selection

This web application was developed in **.NET Core**. I chose .NET Core due to its cross-platform features, high performance, and commitment to the latest web standards, ensuring a versatile, efficient, and future-proof solution. The application's architecture was divided into two major components: the backend and the frontend. The backend retrieves and builds the character list from the source APIs, while the frontend handles design and user interactions. The separation of responsibilities improves the maintainability and scalability of the application.

## Project Structure

The project was structured into three layers: the **Data Access Layer (DAL)**, the **Business Logic Layer (BLL)**, and the **Web Application (UI)**. An essential strategy for project architecture was to use a rich domain model, as seen by the `StarWarsProvider` class. This class functioned as more than just a data container; it encapsulated the complex logic of receiving and converting data from the Star Wars external API. This technique provided a clear separation of concerns, allowing the `StarWarsProvider` to adapt to changes in the external API without disturbing the rest of the application. To create a structured communication flow, the **Interface Segregation Principle (ISP)** was used, which defined a contract between the Web Application and the CharacterService Business Logic Layer. The **Single Responsibility Principle (SRP)** led the design of `CharacterService`, which focused on caching and collecting character lists, whilst `StarWarsProvider` focused on creating the list from the source API endpoints.

To summarise, the project's design used a rich domain model approach with the `StarWarsProvider`, using the **Interface Segregation Principle (ISP)** for layer communication and the **Single Responsibility Principle (SRP)** to define different duties. This design not only effectively isolated service-specific functionality but also encouraged a clear division of labour, resulting in a modular, maintainable, and scalable structure.

## Design Considerations

The website caters to gamers with an appealing Star Wars idea, in which players take on the role of a young Padawan and are tasked with matching fee targets by pairing the unique planet-character combination. The program uses the **Observer Pattern** to deliver real-time updates to total fees as users interact with the character list, increasing interaction. To further increase user engagement, I implemented a match-the-fee feature that invites the user to match a total from a randomly selected set of characters. This dynamic feature adds a layer of strategy and engagement, transforming the website into an immersive experience.

**Bootstrap** was chosen as the toolkit due to its extensive library of CSS styles and JavaScript plugins. It allowed me to quickly prototype the interface and ensured a consistent look and feel across different browsers and devices. **Font Awesome** was used for icons to add visual interest and reinforce the Star Wars theme.

## Over-Engineering

While the application was intended to give a seamless user experience, some features were incorporated that were over-engineered. These include serving the character data via an API and loading the characters after the page loads, storing user selections locally to preserve them between sessions or tabs, and implementing memory caching to reduce API requests to the source API. However, these features had been considered essential to enhance the user experience and overall functionality of the application.

## Resilience Implementation

The **Polly** package was utilized to create a resilient `HttpClient`. This enables the application to recover gracefully from temporary failures, hence improving its reliability and usability. The lifetime of `HttpMessageHandler` instances was managed via the `HttpClientFactory`, avoiding any potential issues that can occur when handling `HttpClient` lifetimes manually.
