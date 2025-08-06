export type Post = {
  id: string;
  title: string;
  image: string;
  profileImage: string;
  description: string;
  hashtags: string[];
  categories: string[];
  username: string;
};

export const posts: Post[] = [
  {
    id: "1",
    title: "Animation",
    image: "https://media.discordapp.net/attachments/675674163654164480/1399094778548981802/1CA1iwRLx0lTNr4bBiregsA.png?ex=6887c00d&is=68866e8d&hm=9598978f5a7641689be2010fd2675d6497f531bf0464770eead152b8f7b3de56&=&format=webp&quality=lossless",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    description: "Beyond the cliffs and crashing waves lies a trail few have dared to follow.",
    hashtags: ["#ghibli", "#anime"],
    categories: ["Nature", "Travel"],
    username: "ghibli1over",
  },
  {
    id: "2",
    title: "City Lights at Night",
    image: "https://fastly.picsum.photos/id/16/2500/1667.jpg?hmac=uAkZwYc5phCRNFTrV_prJ_0rP0EdwJaZ4ctje2bY7aE",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    description: "When the last light fades over the ridge, the forest awakens with ancient rhythms, and every rustling leaf becomes part of a legend you were born to witness.",
    hashtags: ["#citylife", "#photography", "#night"],
    categories: ["Photography", "Urban"],
    username: "gvishtipo",
  },
  {
    id: "3",
    title: "Fresh Food Market",
    image: "https://fastly.picsum.photos/id/28/4928/3264.jpg?hmac=GnYF-RnBUg44PFfU5pcw_Qs0ReOyStdnZ8MtQWJqTfA",
    profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
    description: "Deep in the heart of an untouched valley, beneath skies painted with wandering stars, lies a story waiting to be lived. Through whispering forests, crumbling ruins, and firelit nights, your journey isn’t just about where you go, but who you become.",
    hashtags: ["#foodie", "#culture", "#local"],
    categories: ["Food", "Culture"],
    username: "shen",
  },
  {
    id: "4",
    title: "Surf’s Up!",
    image: "https://fastly.picsum.photos/id/31/3264/4912.jpg?hmac=lfmmWE3h_aXmRwDDZ7pZb6p0Foq6u86k_PpaFMnq0r8",
    profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
    description: "Golden sunsets bathe the wildlands, whispering stories of forgotten kings.",
    hashtags: ["#surfing", "#ocean", "#lifestyle"],
    categories: ["Sports", "Travel"],
    username: "ioio",
  },
  {
    id: "5",
    title: "Coffee & Creativity",
    image: "https://fastly.picsum.photos/id/43/1280/831.jpg?hmac=glK-rQ0ppFClW-lvjk9FqEWKog07XkOxJf6Xg_cU9LI",
    profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
    description: "Sail through emerald waters and past towering cliffs where myths were born. Each crashing wave pulls you deeper into a world untouched by time or fear.",
    hashtags: ["#coffee", "#productivity", "#work"],
    categories: ["Lifestyle", "Work"],
    username: "panda",
  },
  {
    id: "6",
    title: "Desert Mirage",
    image: "https://fastly.picsum.photos/id/49/1280/792.jpg?hmac=NnUJy0O9-pXHLmY2loqVs2pJmgw9xzuixgYOk4ALCXU",
    profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
    description: "Far from the reach of cities and machines, the wind carries echoes of a world still wild and free. Venture into ancient groves and cloud-kissed peaks, where every moment feels like the first page of a forgotten epic.",
    hashtags: ["#desert", "#sunset", "#travel"],
    categories: ["Nature", "Adventure"],
    username: "datvi",
  },
  {
    id: "7",
    title: "Fitness First",
    image: "https://fastly.picsum.photos/id/50/4608/3072.jpg?hmac=E6WgCk6MBOyuRjW4bypT6y-tFXyWQfC_LjIBYPUspxE",
    profileImage: "https://randomuser.me/api/portraits/men/7.jpg",
    description: "A horizon stretched in silence, broken only by the soft tread of your boots. In these forgotten lands, the sky breathes, and the mountains remember.",
    hashtags: ["#fitness", "#motivation", "#health"],
    categories: ["Health", "Lifestyle"],
    username: "beli",
  },
  {
    id: "8",
    title: "Modern Interiors",
    image: "https://fastly.picsum.photos/id/45/4592/2576.jpg?hmac=Vc7_kMYufvy96FxocZ1Zx6DR1PNsNQXF4XUw1mZ2dlc",
    profileImage: "https://randomuser.me/api/portraits/women/8.jpg",
    description: "Frozen winds howl through towering peaks, calling adventurers into the unknown.",
    hashtags: ["#design", "#home", "#minimal"],
    categories: ["Design", "Lifestyle"],
    username: "mela",
  },
  {
    id: "9",
    title: "Cultural Parade",
    image: "https://fastly.picsum.photos/id/54/3264/2176.jpg?hmac=blh020fMeJ5Ru0p-fmXUaOAeYnxpOPHnhJojpzPLN3g",
    profileImage: "https://randomuser.me/api/portraits/men/9.jpg",
    description: "In the stillness of twilight, a hidden path reveals itself beneath the stars.",
    hashtags: ["#festival", "#tradition", "#culture"],
    categories: ["Culture", "Events"],
    username: "nikagamer123",
  },
  {
    id: "10",
    title: "Bookworm Weekend",
    image: "https://fastly.picsum.photos/id/58/1280/853.jpg?hmac=YO3QnOm9TpyM5DqsJjoM4CHg8oIq4cMWLpd9ALoP908",
    profileImage: "https://randomuser.me/api/portraits/women/10.jpg",
    description: "Cozy weekends and good stories.",
    hashtags: ["#reading", "#books", "#relax"],
    categories: ["Lifestyle", "Education"],
    username: "shveli",
  },
];
