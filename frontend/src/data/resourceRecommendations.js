// Centralized content recommendations for books and genres.
// Data is intentionally opinionated and can be extended via CMS later.

const normalizeKey = (value = '') =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export const bookResourceMap = {
    [normalizeKey('The Midnight Library')]: {
        insights: [
            'Explores multiverse themes while grounding the story in mental health conversations—great gateway for readers curious about speculative realism.',
            'Pairs well with discussions about regret, resilience, and life pivot points; ideal for book clubs wanting reflective prompts.',
        ],
        websites: [
            {
                name: 'Penguin Reading Guide',
                url: 'https://www.penguinrandomhouse.com/books/592274/the-midnight-library-by-matt-haig/',
                summary: 'Official guide with thought-provoking discussion questions and author insights.',
            },
            {
                name: 'Book Club Chat',
                url: 'https://bookclubchat.com/books/the-midnight-library-book-club-questions/',
                summary: 'Detailed chapter-by-chapter questions perfect for moderated reading circles.',
            },
            {
                name: 'LitLovers',
                url: 'https://www.litlovers.com/reading-guides/fiction/11402-the-midnight-library-haig',
                summary: 'Critical analysis, layered themes, and group discussion starters.',
            },
        ],
        youtube: [
            {
                title: 'The Midnight Library Book Review',
                channel: 'PeruseProject',
                url: 'https://www.youtube.com/@PeruseProject',
                duration: '19:45',
                takeaway: 'Thoughtful take on the multiple lives and emotional resonance of the finale.',
            },
            {
                title: 'Should You Read The Midnight Library?',
                channel: 'Jack Edwards',
                url: 'https://www.youtube.com/@JackEdwards',
                duration: '11:28',
                takeaway: 'Balanced review highlighting the philosophical questions Matt Haig poses.',
            },
        ],
        articles: [
            {
                title: 'Why The Midnight Library Resonates with Burned-Out Millennials',
                outlet: 'The Guardian',
                url: 'https://www.theguardian.com/books/2021/feb/20/the-midnight-library-review',
            },
            {
                title: 'Lessons on Regret from Matt Haig’s Bestseller',
                outlet: 'Medium – Mind Cafe',
                url: 'https://mindcafe.medium.com/the-midnight-library-lessons-regret',
            },
        ],
    },
    [normalizeKey('Project Hail Mary')]: {
        insights: [
            'Technically dense but surprisingly warm buddy-adventure; perfect for STEM-curious readers and sci-fi skeptics alike.',
            'Audio edition is a fan-favorite because of Rocky’s sound design—recommend it to auditory learners.',
        ],
        websites: [
            {
                name: 'Tor.com Review',
                url: 'https://www.tor.com/2021/05/04/book-reviews-project-hail-mary-andy-weir/',
                summary: 'Deep dive into the novel’s hard-science pacing and puzzle-box structure.',
            },
            {
                name: 'Reading Wrap on Goodreads',
                url: 'https://www.goodreads.com/book/show/54493401-project-hail-mary',
                summary: 'Thousands of community reviews with spoiler-tagged science breakdowns.',
            },
        ],
        youtube: [
            {
                title: 'Project Hail Mary Review',
                channel: 'Daniel Greene',
                url: 'https://www.youtube.com/@DanielGreeneReviews',
                duration: '13:06',
                takeaway: 'Highlights why the book works even if you bounced off The Martian.',
            },
            {
                title: 'Science Fiction Book Reviews',
                channel: 'Real Engineering',
                url: 'https://www.youtube.com/@RealEngineering',
                duration: '17:59',
                takeaway: 'Engineer reacts to the Astrophage problem-solving and plausibility.',
            },
        ],
        articles: [
            {
                title: 'Andy Weir Talks Project Hail Mary',
                outlet: 'Polygon',
                url: 'https://www.polygon.com/22420368/project-hail-mary-andy-weir-interview',
            },
            {
                title: 'What Project Hail Mary Teaches about Collaboration',
                outlet: 'Medium – Better Humans',
                url: 'https://betterhumans.pub/project-hail-mary-collaboration-lessons',
            },
        ],
    },
};

export const genreResourceMap = {
    [normalizeKey('Science Fiction')]: {
        insights: [
            'Readers gravitate to "competence porn"—recommend titles where protagonists solve layered technical problems under pressure.',
            'Pair book picks with NASA/JPL explainers to convert sci-fi dabblers into lifers.',
        ],
        websites: [
            {
                name: 'Tor.com',
                url: 'https://www.tor.com/category/all-book-reviews/science-fiction/',
                summary: 'Editorially rigorous science fiction reviews across traditional and indie titles.',
            },
            {
                name: 'File 770',
                url: 'http://file770.com/',
                summary: 'Daily round-ups on Hugo chatter, author news, and fan discourse.',
            },
            {
                name: 'r/PrintSF Resources',
                url: 'https://www.reddit.com/r/printSF/wiki/index/',
                summary: 'Crowd-sourced indexes of sub-genre recommendation threads and reading orders.',
            },
        ],
        youtube: [
            {
                title: 'Top Modern Sci-Fi Books',
                channel: 'Daniel Greene',
                url: 'https://www.youtube.com/@DanielGreeneReviews',
                duration: '15:04',
            },
            {
                title: 'How to Start with Sci-Fi',
                channel: 'Leighanne\'s Lit',
                url: 'https://www.youtube.com/@LeighannesLit',
                duration: '12:31',
            },
        ],
        articles: [
            {
                title: 'The New Golden Age of Science Fiction',
                outlet: 'WIRED',
                url: 'https://www.wired.com/story/new-golden-age-science-fiction/',
            },
            {
                title: 'Medium: Hard Sci-Fi Starter Pack',
                outlet: 'Medium – Sci-Fi Mind',
                url: 'https://medium.com/scifi-mind/hard-science-fiction-starter-pack',
            },
        ],
    },
    [normalizeKey('Fantasy')]: {
        insights: [
            'Portal fantasies and cozy low-stakes adventures are trending—mix in lighter picks alongside epic door-stoppers.',
            'Readers appreciate maps, pronunciation guides, and spoiler-safe worldbuilding primers.',
        ],
        websites: [
            {
                name: 'The Fantasy Inn',
                url: 'https://www.thefantasyinn.com/',
                summary: 'Podcast plus blog featuring author interviews and spoiler-light reviews.',
            },
            {
                name: 'Fantasy Hive',
                url: 'https://fantasy-hive.co.uk/category/reviews/',
                summary: 'Indie-friendly coverage with sub-genre tagging and content warnings.',
            },
            {
                name: 'Reddit r/Fantasy Megathreads',
                url: 'https://www.reddit.com/r/Fantasy/wiki/index',
                summary: 'Weekly recommendation threads, bingo challenges, and community read-alongs.',
            },
        ],
        youtube: [
            {
                title: 'Best Adult Fantasy Releases',
                channel: 'Elliot Brooks',
                url: 'https://www.youtube.com/@ElliotBrooks',
                duration: '18:12',
            },
            {
                title: 'Cozy Fantasy Starter Guide',
                channel: 'Bookborn',
                url: 'https://www.youtube.com/@Bookborn',
                duration: '14:22',
            },
        ],
        articles: [
            {
                title: 'Why Cozy Fantasy Is Having a Moment',
                outlet: 'Tor.com',
                url: 'https://www.tor.com/2023/02/27/cozy-fantasy-boom/',
            },
            {
                title: 'Medium: Building Fantasy Worlds Readers Trust',
                outlet: 'Medium – The Writing Cooperative',
                url: 'https://writingcooperative.com/building-fantasy-worlds-readers-trust',
            },
        ],
    },
};

export const evergreenYoutubeChannels = [
    {
        name: 'PeruseProject',
        focus: 'Book reviews, reading vlogs, and literary discussions',
        url: 'https://www.youtube.com/@PeruseProject',
    },
    {
        name: 'Daniel Greene',
        focus: 'Fantasy and sci-fi book reviews, author interviews',
        url: 'https://www.youtube.com/@DanielGreeneReviews',
    },
    {
        name: 'Jack Edwards',
        focus: 'Book reviews, reading challenges, and bookish lifestyle',
        url: 'https://www.youtube.com/@JackEdwards',
    },
    {
        name: 'Leighanne\'s Lit',
        focus: 'Sci-fi and fantasy book recommendations',
        url: 'https://www.youtube.com/@LeighannesLit',
    },
    {
        name: 'Elliot Brooks',
        focus: 'Fantasy book reviews and recommendations',
        url: 'https://www.youtube.com/@ElliotBrooks',
    },
    {
        name: 'Bookborn',
        focus: 'Cozy fantasy and book recommendations',
        url: 'https://www.youtube.com/@Bookborn',
    },
];

export const mediumSpotlightArticles = [
    {
        title: 'How to Build a Better Reading Habit',
        author: 'Better Humans',
        url: 'https://medium.com/better-humans',
    },
    {
        title: 'The Benefits of Reading Every Day',
        author: 'Personal Growth',
        url: 'https://medium.com/personal-growth',
    },
    {
        title: 'How to Become a Better Reader',
        author: 'The Writing Cooperative',
        url: 'https://medium.com/the-writing-cooperative',
    },
    {
        title: 'Science Fiction and Philosophy',
        author: 'Sci-Fi Mind',
        url: 'https://medium.com/tag/science-fiction',
    },
    {
        title: 'Book Review Insights',
        author: 'Mind Cafe',
        url: 'https://medium.com/mind-cafe',
    },
];

export { normalizeKey };
