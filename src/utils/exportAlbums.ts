interface Album {
  id: string;
  title: string;
  artist: string | null;
  disk_number: number;
  cover_url: string | null;
  genre: string | null;
  year: number | null;
  bars?: { name: string };
}

interface Song {
  id: string;
  album_id: string;
  title: string;
  track_number: number;
  artist: string | null;
  duration: string | null;
}

interface AlbumWithSongs extends Album {
  songs: Song[];
}

export function exportAlbumsForPrint(albums: AlbumWithSongs[], barName?: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Album Export - ${barName || 'Namjukes'}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 1cm;
      }
      .page-break {
        page-break-after: always;
      }
      .no-print {
        display: none;
      }
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: white;
      color: black;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .header p {
      margin: 5px 0;
      color: #666;
    }
    .album {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .album-header {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-left: 4px solid #000;
    }
    .album-cover {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border: 1px solid #ddd;
      flex-shrink: 0;
    }
    .album-cover-placeholder {
      width: 120px;
      height: 120px;
      background: #e0e0e0;
      border: 1px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #999;
      flex-shrink: 0;
    }
    .album-info {
      flex: 1;
    }
    .album-info h2 {
      margin: 0 0 10px 0;
      font-size: 20px;
    }
    .album-info p {
      margin: 5px 0;
      font-size: 14px;
      color: #333;
    }
    .disc-number {
      display: inline-block;
      background: #000;
      color: white;
      padding: 5px 15px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 10px;
    }
    .songs-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .songs-table th {
      background: #000;
      color: white;
      padding: 10px;
      text-align: left;
      font-size: 12px;
      font-weight: bold;
    }
    .songs-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
      font-size: 13px;
    }
    .songs-table tr:nth-child(even) {
      background: #f9f9f9;
    }
    .track-number {
      width: 50px;
      text-align: center;
      font-weight: bold;
    }
    .song-title {
      font-weight: 500;
    }
    .song-duration {
      width: 80px;
      text-align: right;
      color: #666;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 10px 20px;
      background: #000;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      z-index: 1000;
    }
    .print-button:hover {
      background: #333;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Print</button>
  
  <div class="header">
    <h1>${barName || 'Namjukes'} - Album Catalog</h1>
    <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    <p>Total Albums: ${albums.length}</p>
  </div>

  ${albums.map((album, index) => `
    <div class="album ${index > 0 && index % 2 === 0 ? 'page-break' : ''}">
      <div class="album-header">
        ${album.cover_url 
          ? `<img src="${album.cover_url}" alt="${album.title}" class="album-cover" />`
          : `<div class="album-cover-placeholder">No Cover</div>`
        }
        <div class="album-info">
          <span class="disc-number">Disc #${album.disk_number}</span>
          <h2>${album.title}</h2>
          <p><strong>Artist:</strong> ${album.artist || 'Unknown'}</p>
          ${album.genre ? `<p><strong>Genre:</strong> ${album.genre}</p>` : ''}
          ${album.year ? `<p><strong>Year:</strong> ${album.year}</p>` : ''}
          ${album.bars?.name ? `<p><strong>Bar:</strong> ${album.bars.name}</p>` : ''}
        </div>
      </div>
      
      ${album.songs && album.songs.length > 0 ? `
        <table class="songs-table">
          <thead>
            <tr>
              <th class="track-number">#</th>
              <th class="song-title">Song Title</th>
              <th>Artist</th>
              <th class="song-duration">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${album.songs
              .sort((a, b) => a.track_number - b.track_number)
              .map(song => `
                <tr>
                  <td class="track-number">${song.track_number}</td>
                  <td class="song-title">${song.title}</td>
                  <td>${song.artist || album.artist || '-'}</td>
                  <td class="song-duration">${song.duration || '-'}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: #999; font-style: italic;">No songs available</p>'}
    </div>
  `).join('')}

  <div class="footer">
    <p>© ${new Date().getFullYear()} Namjukes - Digital Jukebox Companion</p>
  </div>
</body>
</html>
  `;

  // Create blob and download
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${barName || 'albums'}_export_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
