import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css'; // estilizacao padrao 

import { usePlayer } from '../../contexts/PlayerContext';

import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);

    const { 
        episodeList, 
        currentEpisodeIndex, 
        isPlaying,
        isLooping,
        isShuffling, 
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayingState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        clearPlayState,
    } = usePlayer();

    // efeitos colaterais - qnd alguma coisa muda, executa algo - useEffect
    useEffect(() => { 
        if (!audioRef.current) { //busca o 'valor' atual da referencia
            return;
        } 

        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();   
        }
    }, [isPlaying]) //a função é disparada toda vez que isPlaying for alterado
    
    function setupProgressListener() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime))
        })
    }

    function handleSeek(amount : number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded() {
        if( hasNext) {
            playNext()
        } else {
            clearPlayState()
        }
    }

    const episode = episodeList[currentEpisodeIndex];
    
    return(
        <div className={styles.playerContainer}>
            <header>
                <img src="/assets/playing.svg" alt="Tocando agora"/>
                <strong>Tocando agora </strong>
            </header>

            { episode ? (
                <div className={styles.currentEpisode}>
                    <Image 
                        width={592} 
                        height={592}
                        src={episode.thumbnail}
                        objectFit="cover"
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            ) }

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {episode ? (
                            <Slider 
                                max={episode.duration}
                                value={progress}
                                onChange={handleSeek}
                               trackStyle={{ backgroundColor: '#04d361'}} 
                                railStyle={{ backgroundColor: '#9f75ff'}}
                                handleStyle={{ borderColor: '#04d361', borderWidth: 4}}
                            />
                        ) : (
                            <div className={styles.emptySlider} />
                        )}
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                { episode &&  (
                    <audio
                        src={episode.url}
                        ref={audioRef}
                        loop={isLooping}
                        autoPlay
                        onEnded={handleEpisodeEnded}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                        onLoadedMetadata={setupProgressListener}
                    />
                )}

                <div className={styles.buttons}>
                    <button 
                        type="button" 
                        disabled={!episode || episodeList.length === 1}
                        onClick={toggleShuffle}
                        className={isShuffling? styles.isActive : ''}
                    >
                        <img src="/assets/shuffle.svg" alt="Embaralhar"/>
                    </button>
                    <button 
                        type="button" 
                        disabled={!episode || !hasPrevious}
                        onClick={playPrevious}
                    >
                        <img src="/assets/play-previous.svg" alt="Tocar anterior"/>
                    </button>
                    <button 
                        type="button" 
                        className={styles.playButton} 
                        disabled={!episode} 
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <img src="/assets/pause.svg" alt="Tocar"/>
                        ) : (
                            <img src="/assets/play.svg" alt="Tocar"/>
                        )}
                    </button>
                    <button 
                        type="button" 
                        disabled={!episode || !hasNext}
                        onClick={playNext}
                    >
                        <img src="/assets/play-next.svg" alt="Tocar próxima"/>
                    </button>
                    <button 
                        type="button" 
                        disabled={!episode}
                        onClick={toggleLoop}
                        className={isLooping? styles.isActive : ''}
                    >
                        <img src="/assets/repeat.svg" alt="Repetir"/>
                    </button>
                </div>
            </footer>
        </div>
    );
}