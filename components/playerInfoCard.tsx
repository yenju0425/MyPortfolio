import styles from '../styles/Player.module.css';

interface PlayerInfo {
  id: number;
  name: string;
  currentChip: number;
  betSize: number;
}

const PlayerInfoCard = ({ name, currentChip, betSize }: PlayerInfo) => {
  return (
    <div>
      <h2>{name}</h2>
      <p>Current Chip: {currentChip}</p>
      <p>Bet Size: {betSize}</p>
      <button>Call</button>
    </div>
  );
};

export default PlayerInfoCard;