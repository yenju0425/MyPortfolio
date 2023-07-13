# [My "Poker" Portfolio ♠️ ♥️ ♦️ ♣️](http://13.211.167.3:3000)

I'm excited to share my portfolio with you! I've put a lot of effort into this project and I'm proud of the results. I hope you enjoy exploring it as much as I do!

This portfolio is built using Next.js and Socket.io, creating an immersive gaming experience through a real-time online poker game. While the backend logic is almost complete, the frontend part is still a work in progress. I will continue working on it and regularly update this repository, so stay tuned for more updates!

## Roadmap 🗺

- [x] Feb. Formulating ideas:
    - Defining the portfolio sections:
        - Home: A captivating first page.
        - About: Background information about me.
        - Notes: Study notes.
        - Contact: Ways to get in touch with me.
        - POKER: The highlight of my portfolio!
    - Tools used to implement my ideas:
        - Next.js
        - TypeScript
        - Socket.io

- [x] Mar. Designing my portfolio: [Design](https://www.figma.com/file/9usTFZapvmAlZDlqWjWqkz/Taxes-Hold'em-(State)?type=whiteboard&node-id=0%3A1&t=g0gFFLPsrJ8NQiXV-1)
    - Creating the visual layout of my portfolio.
    - Developing the logic diagram for the poker game (the most crucial part of the project, which presented interesting challenges).
        - Studying poker rules, including determining winners and handling ties.
        - Considering various details, such as player disconnections and force quits.
        - Building everything from scratch.

- [x] Apr. Frontend coding (excluding the poker game):
    - Learning Next.js.
    - Learning TypeScript.
    - Establishing the foundational structure of the portfolio.

- [x] May. Backend coding for the poker game:
    - Exploring Socket.io.
    - Implementing the poker game's framework, including the game cycle.
    - Implementing key algorithms for the poker game, such as determining winners and handling ties. [Hand Ranking Algorithm](https://github.com/yenju0425/MyPortfolio/blob/main/games/sng/modules/sngRound.ts#L50)

- [x] Jun. Frontend coding for the poker game:
    - Creating 9 seats on the frontend, each displaying player information and providing buttons and forms for player interaction.
    - Completing the frontend logic to communicate with the backend, such as showing check, call, and fold buttons based on game rules.

- [x] Jul. Testing the poker game and deploying the project:
    - Conducting thorough testing with friends.
    - Resolving any bugs or issues identified during testing.
    - Deploying the project on AWS EC2.

- [ ] Aug. Enhancing the appearance and user experience:
    - Completing the remaining frontend sections (excluding the poker game)
        - Home: Adding animations for a dynamic page.
        - About: Providing additional background information about myself.
        - Notes: Including selected study notes.
        - Contact: Adding a contact form.
    - Making the portfolio responsive for different screen sizes, including mobile phones and tablets.

- [ ] Sep. Improving the poker game:
    - Enhancing the appearance of the poker game:
        - Making the game responsive for various screen sizes, allowing players to enjoy the game on their phones.
        - Enhancing the user experience of the poker game:
            - Using slide bars for betting instead of buttons.
            - Moving the buttons to the bottom of the screen for better accessibility.
    - Implementing remaining backend features for the poker game:
        - Auto-action: Allowing players to auto-check, auto-call, or auto-fold when it's not their turn.
        - Time limit: Enforcing time limits for player decisions, with the system automatically checking or folding based on the current situation to optimize players' profits.

- [ ] Oct. Further enhancements to the poker game:
    - Enabling players to create their own rooms and customize game configurations.
    - Allowing players to connect to specific gaming rooms using room IDs.

- [ ] Nov. Adding user authentication:
    - Integrating Next.js with a database system for user authentication.
    - Providing custom features exclusively for authenticated users.
    - Offering lobby games for unauthenticated users.

- [ ] Dec. Building a backstage system to monitor my portfolio:
    - Creating a dashboard to track portfolio metrics, such as visitor count, player count, and games played.
    - Enabling me to manage the lobby games through the backstage system.

## Demonstrations 🎥

Here are some video demonstrations of my portfolio:

- [Overview](https://drive.google.com/file/d/1EKI7pFWxGnEXF5HApOq_5y5GNHzaw1Ti/view?usp=sharing)
- [Demo](https://drive.google.com/file/d/1yFudj6SczE8lS4g6uH8elyVnzWP0Si_k/view?usp=sharing)

I hope you find my portfolio interesting and engaging. Feel free to explore and reach out to me with any feedback or inquiries. Thank you!

## Acknowledgements 🙏

I would like to express my heartfelt gratitude to my brother Robert and my best friend Bijon for their invaluable technical advice and tremendous help during the testing phase of the poker game. This project would not have been possible without their unwavering support and contributions.