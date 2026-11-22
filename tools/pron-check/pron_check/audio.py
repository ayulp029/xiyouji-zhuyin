import subprocess, hashlib
import numpy as np


def load_audio(path, sr=16000):
    """ffmpeg → mono float32 numpy。不使用 av。"""
    cmd = ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def sha(y, extra=""):
    return hashlib.sha1(y.tobytes() + extra.encode()).hexdigest()[:16]


def prep_for_asr(y, sr, pad_sec, peak):
    pad = np.zeros(int(pad_sec * sr), dtype=np.float32)
    p = float(np.max(np.abs(y))) if len(y) else 0.0
    if p > 1e-4 and peak:
        y = y * (peak / p)
    return np.concatenate([pad, y, pad]), pad_sec
