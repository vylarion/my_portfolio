import { useEffect, useRef } from 'react';

const text = ["hello there", "i am samya", "music producer", "pen tester", "anime", "full stack developer", "photographer", "ui/ux designer", "repeat!"];

class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

export default function ScrambleText(props) {
  const elRef = useRef(null);
  const fxRef = useRef(null);

  useEffect(() => {
    if (elRef.current) {
      fxRef.current = new TextScramble(elRef.current);
      let counter = 0;
      const next = () => {
        fxRef.current.setText(text[counter]).then(() => {
          setTimeout(next, 800);
        });
        counter = (counter + 1) % text.length;
      };
      next();
    }
    return () => {
      if (fxRef.current) {
        cancelAnimationFrame(fxRef.current.frameRequest);
      }
    };
  }, []);

  return <div ref={elRef} {...props}></div>;
}