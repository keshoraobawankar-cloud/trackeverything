import { AnimeVoiceCharacter } from '../types';

export const ANIME_CHARACTERS: AnimeVoiceCharacter[] = [
  {
    id: 'shonen-hero',
    name: 'Ren (Shonen Protagonist)',
    animeArchetype: 'Hot-blooded determination',
    tagline: 'Limit break! Your potential has no ceiling!',
    pitch: 1.25,
    rate: 1.15,
    accent: 'en-US',
    motivationalPhrases: [
      'Wake up, warrior! The day won\'t conquer itself! Push past your limits!',
      'Pain is just weakness leaving your body! Fire up your spirit and let\'s lock in!',
      'Even when exhausted, true champions take one more step! Plus Ultra!'
    ]
  },
  {
    id: 'zen-sensei',
    name: 'Master Jin (Zen Sensei)',
    animeArchetype: 'Ancient calm & clarity',
    tagline: 'Stillness in the mind, precision in action.',
    pitch: 0.85,
    rate: 0.9,
    accent: 'en-GB',
    motivationalPhrases: [
      'Breathe deeply. Quiet the storm in your thoughts and focus only on this single stroke.',
      'A thousand-mile mountain is ascended single pebble at a time. Return to the breath.',
      'Distraction is merely an illusion. Anchor yourself in deliberate mastery.'
    ]
  },
  {
    id: 'cyber-commander',
    name: 'Unit-07 (Cyberpunk Strategist)',
    animeArchetype: 'High-tech tactical discipline',
    tagline: 'Neural overclock 99.4%. Protocol: Unstoppable.',
    pitch: 1.05,
    rate: 1.08,
    accent: 'en-US',
    motivationalPhrases: [
      'Tactical deep-work protocol initiated. Eliminate cognitive lag immediately.',
      'System diagnostics optimal. Dopamine leaks patched. Execute priority directives now.',
      'Cognitive frequency aligned. No surrender, zero deviation from mission parameters.'
    ]
  },
  {
    id: 'tsundere-rival',
    name: 'Asuka (Tsundere Rival)',
    animeArchetype: 'Fierce tough-love encouragement',
    tagline: 'It\'s not like I care if you win... just don\'t slack off!',
    pitch: 1.35,
    rate: 1.12,
    accent: 'en-US',
    motivationalPhrases: [
      'B-Baka! Are you really going to give up before me? Get off your phone and study!',
      'Hmph! Don\'t make excuses! I expect you to crush this session, got it?!',
      'I-It\'s not like I prepared this study session for you... but you better get an A!'
    ]
  },
  {
    id: 'lofi-guide',
    name: 'Aoi (Cozy Lofi Companion)',
    animeArchetype: 'Gentle warmth & restoration',
    tagline: 'Soft rains, hot tea, and steady progress.',
    pitch: 1.1,
    rate: 0.95,
    accent: 'en-US',
    motivationalPhrases: [
      'Take a gentle sip of water. You have done so well today. Let\'s continue quietly.',
      'No need to rush. Every small effort blooms into great wisdom. I\'m right here with you.',
      'Rest your shoulders, release your jaw. You are completely safe and capable.'
    ]
  }
];

// Web Audio sound synthesizer for crisp futuristic chimes and alarm frequencies
export function playChimeTone(type: 'success' | 'alarm' | 'focus' | 'alert' = 'focus') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.45);
      });
    } else if (type === 'alarm') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'alert') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, ctx.currentTime);
      osc.frequency.setValueAtTime(850, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else {
      // Focus bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, ctx.currentTime); // 432Hz calming tuning
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    }
  } catch (err) {
    console.error('Audio synthesizer error:', err);
  }
}

// Speak anime voice phrase with SpeechSynthesis & character pitch/rate modulation
export function speakAnimeMotivation(characterId: string, customPhrase?: string): Promise<boolean> {
  return new Promise((resolve) => {
    playChimeTone('alarm');

    if (!('speechSynthesis' in window)) {
      resolve(false);
      return;
    }

    const char = ANIME_CHARACTERS.find((c) => c.id === characterId) || ANIME_CHARACTERS[0];
    const phrase = customPhrase || char.motivationalPhrases[Math.floor(Math.random() * char.motivationalPhrases.length)];

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.pitch = char.pitch;
    utterance.rate = char.rate;
    utterance.volume = 1;

    // Pick suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      if (char.id === 'shonen-hero' || char.id === 'tsundere-rival') {
        const higherVoice = voices.find(v => v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Google UK English Female') || v.lang.startsWith('en'));
        if (higherVoice) utterance.voice = higherVoice;
      } else if (char.id === 'zen-sensei') {
        const deeperVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Male'));
        if (deeperVoice) utterance.voice = deeperVoice;
      }
    }

    utterance.onend = () => resolve(true);
    utterance.onerror = () => resolve(false);

    window.speechSynthesis.speak(utterance);
  });
}
