import React, { useState } from 'react';
import styles from '../styles/Player.module.css';
import { PlayerStatus } from '../games/base/terms';

interface PlayerInfo {
  id: number;
  name: string;
  currentChip: number;
  betSize: number;
  currentStatus: PlayerStatus;
}

const PlayerInfoCard = ({ id, name, currentChip, betSize, currentStatus }: PlayerInfo) => {
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className={styles.player_info_card}>

      <div>
        {!showForm && (
          <button className={styles.Control} onClick={toggleForm}>
            SignUp
          </button>
        )}

        {showForm && (
          <form>
            <input type="text" placeholder="Name" />
            <input type="text" placeholder="Email" />
            <button type="submit">Submit</button>
            <button type="button" onClick={toggleForm}>
              Cancel
            </button>
          </form>
        )}
      </div>

      <div>
        <h2>{name}</h2>
        <p>Current Chip: {currentChip}</p>
        <p>Bet Size: {betSize}</p>
        <div>
          <button className={styles.fold}>Fold</button>
          <button className={styles.check}>Check</button>
          <button className={styles.call}>Call</button>
          <button className={styles.bet}>Bet</button>
          <button className={styles.raise}>Raise</button>
          <button className={styles.all_in}>All In</button>
        </div>
      </div>
    </div>
  );
};

export default PlayerInfoCard;