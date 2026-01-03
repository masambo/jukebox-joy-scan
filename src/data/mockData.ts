
export interface Song {
  id: string;
  title: string;
  artist: string;
  diskNumber: number;
  trackNumber: number;
  genre: string;
  albumId: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  diskNumber: number;
  genre: string;
  year: number;
  songs: Song[];
}

export interface Bar {
  id: string;
  name: string;
  logo?: string;
  primaryColor: string;
  accentColor: string;
  albums: Album[];
}

export const mockAlbums: Album[] = [
  {
    id: "1",
    title: "Neon Nights",
    artist: "The Retrowave",
    cover: "/namjukes_albumcover.png",
    diskNumber: 1,
    genre: "Rock",
    year: 1985,
    songs: [
      { id: "1-1", title: "Electric Dreams", artist: "The Retrowave", diskNumber: 1, trackNumber: 1, genre: "Rock", albumId: "1" },
      { id: "1-2", title: "Midnight Drive", artist: "The Retrowave", diskNumber: 1, trackNumber: 2, genre: "Rock", albumId: "1" },
      { id: "1-3", title: "Purple Haze City", artist: "The Retrowave", diskNumber: 1, trackNumber: 3, genre: "Rock", albumId: "1" },
      { id: "1-4", title: "Synthesizer Love", artist: "The Retrowave", diskNumber: 1, trackNumber: 4, genre: "Rock", albumId: "1" },
      { id: "1-5", title: "Dancing in the Dark", artist: "The Retrowave", diskNumber: 1, trackNumber: 5, genre: "Rock", albumId: "1" },
      { id: "1-6", title: "Laser Light Show", artist: "The Retrowave", diskNumber: 1, trackNumber: 6, genre: "Rock", albumId: "1" },
    ],
  },
  {
    id: "2",
    title: "Blue Velvet",
    artist: "Jazz Collective",
    cover: "/namjukes_albumcover.png",
    diskNumber: 2,
    genre: "Jazz",
    year: 1962,
    songs: [
      { id: "2-1", title: "Smooth Operator", artist: "Jazz Collective", diskNumber: 2, trackNumber: 1, genre: "Jazz", albumId: "2" },
      { id: "2-2", title: "Late Night Blues", artist: "Jazz Collective", diskNumber: 2, trackNumber: 2, genre: "Jazz", albumId: "2" },
      { id: "2-3", title: "Saxophone Dreams", artist: "Jazz Collective", diskNumber: 2, trackNumber: 3, genre: "Jazz", albumId: "2" },
      { id: "2-4", title: "Piano in the Rain", artist: "Jazz Collective", diskNumber: 2, trackNumber: 4, genre: "Jazz", albumId: "2" },
      { id: "2-5", title: "Trumpets at Dawn", artist: "Jazz Collective", diskNumber: 2, trackNumber: 5, genre: "Jazz", albumId: "2" },
    ],
  },
  {
    id: "3",
    title: "Country Roads",
    artist: "Western Stars",
    cover: "/namjukes_albumcover.png",
    diskNumber: 3,
    genre: "Country",
    year: 1978,
    songs: [
      { id: "3-1", title: "Dusty Trail", artist: "Western Stars", diskNumber: 3, trackNumber: 1, genre: "Country", albumId: "3" },
      { id: "3-2", title: "Cowboy's Lament", artist: "Western Stars", diskNumber: 3, trackNumber: 2, genre: "Country", albumId: "3" },
      { id: "3-3", title: "Sunset on the Range", artist: "Western Stars", diskNumber: 3, trackNumber: 3, genre: "Country", albumId: "3" },
      { id: "3-4", title: "Home Sweet Home", artist: "Western Stars", diskNumber: 3, trackNumber: 4, genre: "Country", albumId: "3" },
      { id: "3-5", title: "Rodeo Nights", artist: "Western Stars", diskNumber: 3, trackNumber: 5, genre: "Country", albumId: "3" },
      { id: "3-6", title: "Old Guitar", artist: "Western Stars", diskNumber: 3, trackNumber: 6, genre: "Country", albumId: "3" },
      { id: "3-7", title: "Texas Moon", artist: "Western Stars", diskNumber: 3, trackNumber: 7, genre: "Country", albumId: "3" },
    ],
  },
  {
    id: "4",
    title: "Disco Inferno",
    artist: "Funky Town",
    cover: "/namjukes_albumcover.png",
    diskNumber: 4,
    genre: "Disco",
    year: 1979,
    songs: [
      { id: "4-1", title: "Get Down Tonight", artist: "Funky Town", diskNumber: 4, trackNumber: 1, genre: "Disco", albumId: "4" },
      { id: "4-2", title: "Boogie Wonderland", artist: "Funky Town", diskNumber: 4, trackNumber: 2, genre: "Disco", albumId: "4" },
      { id: "4-3", title: "Dancing Queen", artist: "Funky Town", diskNumber: 4, trackNumber: 3, genre: "Disco", albumId: "4" },
      { id: "4-4", title: "Stayin' Alive", artist: "Funky Town", diskNumber: 4, trackNumber: 4, genre: "Disco", albumId: "4" },
      { id: "4-5", title: "Night Fever", artist: "Funky Town", diskNumber: 4, trackNumber: 5, genre: "Disco", albumId: "4" },
    ],
  },
];

export const mockBar: Bar = {
  id: "demo-bar",
  name: "The Vinyl Lounge",
  primaryColor: "280 100% 65%",
  accentColor: "320 100% 60%",
  albums: mockAlbums,
};

export const getAllSongs = (): Song[] => {
  return mockAlbums.flatMap((album) => album.songs);
};

export const getGenres = (): string[] => {
  const genres = new Set(mockAlbums.map((album) => album.genre));
  return Array.from(genres);
};

export const searchSongs = (query: string): Song[] => {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return getAllSongs().filter(
    (song) =>
      song.title.toLowerCase().includes(normalizedQuery) ||
      song.artist.toLowerCase().includes(normalizedQuery)
  );
};

export const filterByGenre = (genre: string): Album[] => {
  return mockAlbums.filter((album) => album.genre === genre);
};
