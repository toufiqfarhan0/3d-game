export type InputAction = 'LANE_LEFT' | 'LANE_RIGHT' | 'JUMP' | 'SLIDE' | 'PAUSE';

export class InputManager {
  private listeners: Map<InputAction, Array<() => void>> = new Map();
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private minSwipeDistance: number = 30;

  constructor() {
    this.initKeyboard();
    this.initTouch();
  }

  public on(action: InputAction, callback: () => void) {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, []);
    }
    this.listeners.get(action)!.push(callback);
  }

  private trigger(action: InputAction) {
    const callbacks = this.listeners.get(action);
    if (callbacks) {
      callbacks.forEach(cb => cb());
    }
  }

  private initKeyboard() {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // Prevent scrolling on arrow keys & space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.trigger('LANE_LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.trigger('LANE_RIGHT');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case ' ':
          this.trigger('JUMP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.trigger('SLIDE');
          break;
        case 'Escape':
        case 'p':
        case 'P':
          this.trigger('PAUSE');
          break;
      }
    });
  }

  private initTouch() {
    window.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const deltaX = e.changedTouches[0].clientX - this.touchStartX;
        const deltaY = e.changedTouches[0].clientY - this.touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal Swipe
          if (Math.abs(deltaX) > this.minSwipeDistance) {
            if (deltaX > 0) {
              this.trigger('LANE_RIGHT');
            } else {
              this.trigger('LANE_LEFT');
            }
          }
        } else {
          // Vertical Swipe
          if (Math.abs(deltaY) > this.minSwipeDistance) {
            if (deltaY < 0) {
              this.trigger('JUMP');
            } else {
              this.trigger('SLIDE');
            }
          }
        }
      }
    }, { passive: true });
  }

  // Setup DOM Touch Buttons
  public bindTouchButtons(leftId: string, rightId: string, jumpId: string, slideId: string) {
    const bindBtn = (id: string, action: InputAction) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.trigger(action);
        });
      }
    };

    bindBtn(leftId, 'LANE_LEFT');
    bindBtn(rightId, 'LANE_RIGHT');
    bindBtn(jumpId, 'JUMP');
    bindBtn(slideId, 'SLIDE');
  }
}
