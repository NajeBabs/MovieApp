import MediaItemCollection from "./components/MediaItemCollection";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7CACA] to-[#93A9D1]">
      <div className="text-center pt-8 pb-4">
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
          Naje: Watchlist 
        </h1>
      </div>
      <MediaItemCollection />
    </div>
  );
}

export default App;