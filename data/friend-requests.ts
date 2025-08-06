export type FriendRequest = {
  username: string;
  displayName: string;
  profilePhoto: string;
  interestMatch: number;
  friends: number;
  followers: number;
  age: number;
  bio: string;
};

export const friendRequests: FriendRequest[] = [
  {
    username: "nature_dan",
    displayName: "Daniel Forest",
    profilePhoto: "https://randomuser.me/api/portraits/men/11.jpg",
    interestMatch: 87,
    friends: 340,
    followers: 1240,
    age: 28,
    bio: "Trail runner and weekend photographer 🌲",
  },
  {
    username: "gamerella",
    displayName: "Ella Nightshade",
    profilePhoto: "https://randomuser.me/api/portraits/women/12.jpg",
    interestMatch: 92,
    friends: 580,
    followers: 3000,
    age: 23,
    bio: "Streaming, cosplaying, and conquering dungeons 🎮✨",
  },
  {
    username: "chef_benny",
    displayName: "Ben Marchesi",
    profilePhoto: "https://randomuser.me/api/portraits/men/13.jpg",
    interestMatch: 76,
    friends: 410,
    followers: 1900,
    age: 35,
    bio: "Food is life — follow for daily recipes 🍝",
  },
  {
    username: "sara_reads",
    displayName: "Sara Moore",
    profilePhoto: "https://randomuser.me/api/portraits/women/14.jpg",
    interestMatch: 81,
    friends: 260,
    followers: 1100,
    age: 30,
    bio: "Always lost in a book 📚",
  },
  {
    username: "techno_tim",
    displayName: "Timur Varga",
    profilePhoto: "https://randomuser.me/api/portraits/men/15.jpg",
    interestMatch: 64,
    friends: 350,
    followers: 980,
    age: 27,
    bio: "Engineer, builder, and part-time futurist 🤖",
  },
  {
    username: "luna.art",
    displayName: "Luna Rivera",
    profilePhoto: "https://randomuser.me/api/portraits/women/16.jpg",
    interestMatch: 95,
    friends: 770,
    followers: 4020,
    age: 25,
    bio: "Mixed media artist & color addict 🎨",
  },
  {
    username: "miles_ahead",
    displayName: "Miles Grant",
    profilePhoto: "https://randomuser.me/api/portraits/men/17.jpg",
    interestMatch: 73,
    friends: 190,
    followers: 800,
    age: 31,
    bio: "Marathoner, podcaster, coffee enthusiast ☕🏃‍♂️",
  },
  {
    username: "zoe_the_coder",
    displayName: "Zoe Andersen",
    profilePhoto: "https://randomuser.me/api/portraits/women/18.jpg",
    interestMatch: 89,
    friends: 510,
    followers: 2200,
    age: 26,
    bio: "Frontend by day, pixel artist by night 💻🎨",
  },
  {
    username: "aj_travels",
    displayName: "AJ Patel",
    profilePhoto: "https://randomuser.me/api/portraits/men/19.jpg",
    interestMatch: 78,
    friends: 460,
    followers: 1500,
    age: 29,
    bio: "Globetrotting with a drone and a backpack 🌍✈️",
  },
  {
    username: "bookish_bella",
    displayName: "Bella Knight",
    profilePhoto: "https://randomuser.me/api/portraits/women/20.jpg",
    interestMatch: 83,
    friends: 325,
    followers: 1010,
    age: 22,
    bio: "Sharing my favorite reads and cozy moments 📖☕",
  },
];
