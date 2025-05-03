import { useEffect, useState } from 'react';
import './App.css';
import { socket } from './socket-client';

interface SquareProps {
  value: string;
  handleClick: () => void;
}

interface WinnerProps {
  [key: string]: string;
}

function Square({ value, handleClick }: SquareProps) {
  return (
    <button className="square" onClick={handleClick}>
      {value}
    </button>
  );
}

const Winner = ({ data }: { data: WinnerProps }) => {
  const cells = [
    ['c1', 'c2', 'c3'],
    ['c4', 'c5', 'c6'],
    ['c7', 'c8', 'c9'],
    ['c1', 'c4', 'c7'],
    ['c2', 'c5', 'c8'],
    ['c3', 'c6', 'c9'],
    ['c1', 'c5', 'c9'],
    ['c3', 'c5', 'c7'],
  ];

  for (let [a, b, c] of cells) {
    if (data[a] && data[a] === data[b] && data[a] === data[c]) {
      return <div>Player {data[a]} is the winner</div>;
    }
  }
  return null;
};

const Board = () => {
  const [state, setState] = useState<WinnerProps>({
    c1: "", c2: "", c3: "",
    c4: "", c5: "", c6: "",
    c7: "", c8: "", c9: "",
  });

  const [mySymbol, setMySymbol] = useState("");
  const [turn, setTurn] = useState("X");
  const [roomId] = useState("room-123");
  const [roomFull, setRoomFull] = useState(false);

  useEffect(() => {
    socket.emit("join_room", roomId);

    socket.on("maximum_players", () => {
      setRoomFull(true);
      alert("Room is full. Please try another room.");
    });

    socket.on("room_users", (users: string[]) => {
      setMySymbol(users.indexOf(socket.id!) === 0 ? "X" : "O");
    });

    socket.on('next_player_turn', ({ key, symbol }) => {
      setState(prev => ({ ...prev, [key]: symbol }));
      setTurn(symbol === "X" ? "O" : "X");
    });

    return () => {
      socket.off("maximum_players");
      socket.off("room_users");
      socket.off("next_player_turn");
    };
  }, [roomId]);

  const handleClick = (key: string) => {
    if (roomFull || state[key] || turn !== mySymbol) {
      return;
    }
    socket.emit("move", { roomId, key, symbol: mySymbol });
  };

  if (roomFull) {
    return <div>Room is full. Cannot join this game.</div>;
  }

  return (
    <>
      <div className="board-row">
        {
          ["c1", "c2", 'c3'].map((itr) =>
            <Square value={state[itr]} handleClick={() => handleClick(itr)} />
          )
        }
      </div>
      <div className="board-row">
        {
          ["c4", "c5", 'c6'].map((itr) =>
            <Square value={state[itr]} handleClick={() => handleClick(itr)} />
          )
        }
      </div>
      <div className="board-row">
        {
          ["c7", "c8", 'c9'].map((itr) =>
            <Square value={state[itr]} handleClick={() => handleClick(itr)} />
          )
        }
      </div>
      <Winner data={state} />
      <p>You are: {mySymbol}</p>
      <p>Current turn: {turn}</p>
    </>
  );
};

function App() {
  return (
    <div>
      <h2>Multiplayer Tic-Tac-Toe</h2>
      <Board />
    </div>
  );
}

export default App;
