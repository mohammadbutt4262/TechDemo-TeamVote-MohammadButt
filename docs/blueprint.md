# **App Name**: TeamVote

## Core Features:

- Idea Display: Display a list of ideas with their title, description, and score.
- Vote Buttons: Implement upvote and downvote buttons for each idea.
- Live Score: Display the score in real-time based on user votes, using optimistic updates.
- Display Voters Username: Show the original posters username on each idea card
- Local Data Persistence: Persist ideas and votes data to local DB using SQLite.
- Username Display: Capture simple username entry and store in localStorage to show who voted

## Style Guidelines:

- Primary color: HSL(210, 70%, 50%) translates to a vibrant blue (#3399FF), providing a modern and trustworthy feel that fits the collaborative voting app.
- Background color: A very light tint of blue at HSL(210, 20%, 95%) translates to (#F0F8FF), ensuring content is readable while maintaining a consistent aesthetic.
- Accent color: Use a complementary teal hue, shifting approximately 30 degrees towards green from the primary color, with HSL(180, 60%, 40%) which converts to hex code #26998F for interactive elements such as buttons or vote indicators, making them stand out.
- Body and headline font: 'Inter' (sans-serif) for a clean and modern interface, promoting readability and a neutral appearance, appropriate for both titles and longer descriptions.
- Employ a clean, card-based layout to display ideas, each containing the title, description, and score. Use consistent spacing and alignment to enhance readability and overall visual harmony.
- Incorporate subtle animations when votes are cast or when new ideas are added, providing engaging feedback to the user.
- Utilize simple and recognizable icons for upvote and downvote actions, enhancing the user's understanding of available actions. Ensure icons are consistent with the overall minimalistic design.