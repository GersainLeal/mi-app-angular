import { Component, signal, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface LogLine {
  time: string;
  type: 'info' | 'success' | 'input' | 'warning';
  tag: string;
  content: string;
}

interface Member {
  name: string;
  role: string;
  avatarText: string;
  theme: string;
  bio: string;
  detailRole: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  template: `
    <!-- Retro Scanlines & Glowing Background overlay -->
    <div class="bg-container"></div>
    <div class="stars-overlay"></div>
    <div class="scanlines"></div>

    @if (isShutdown()) {
      <!-- Off state reboot screen -->
      <div class="retro-window shutdown-screen">
        <div class="title-bar">
          <div class="title-bar-left">
            <div class="title-dot" style="background: var(--neon-pink); box-shadow: 0 0 6px var(--neon-pink-glow)"></div>
            <span class="title-text">offline.sys</span>
          </div>
        </div>
        <div class="card-content" style="padding: 40px; font-family: 'Share Tech Mono', monospace;">
          <h2 style="color: var(--neon-pink); margin-bottom: 20px; font-size: 20px; letter-spacing: 2px;">SYSTEM TERMINATED</h2>
          <p style="color: var(--text-secondary); margin-bottom: 30px; font-size: 13px; line-height: 1.6;">
            El servidor de pruebas se encuentra apagado. Toda la actividad de depuración y logs del Grupo #5 ha sido pausada de forma segura.
          </p>
          <button (click)="rebootServer()" class="member-item cyan-theme" style="width: auto; padding: 12px 24px; font-family: 'Share Tech Mono', monospace; display: flex; justify-content: center; gap: 8px;">
            <span style="color: var(--neon-cyan); font-weight: bold;">[ REBOOT_SYSTEM ]</span>
          </button>
        </div>
      </div>
    } @else {
      <!-- Main Retro Dashboard Window -->
      <div class="retro-window" [style.height]="isMinimized() ? 'auto' : ''">
        <!-- Titlebar -->
        <div class="title-bar">
          <div class="title-bar-left">
            <div class="title-dot"></div>
            <span class="title-text">servidor_pruebas.exe</span>
          </div>
          <div class="title-bar-actions">
            <button class="title-btn collapse" title="Minimizar" (click)="toggleMinimize()" aria-label="Minimize"></button>
            <button class="title-btn close" title="Apagar" (click)="shutdownServer()" aria-label="Shutdown"></button>
          </div>
        </div>

        @if (!isMinimized()) {
          <!-- Window Card Body -->
          <div class="card-content">
            <!-- Glowing SVG Server Icon -->
            <div class="server-icon-container">
              <svg viewBox="0 0 100 100" class="server-icon" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="iconGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#a855f7" />
                    <stop offset="100%" stop-color="#06b6d4" />
                  </linearGradient>
                  <filter id="neonShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <rect x="12" y="12" width="76" height="76" rx="22" fill="url(#iconGlow)" />
                
                <!-- Server 1 -->
                <rect x="28" y="26" width="44" height="12" rx="3.5" fill="none" stroke="#ffffff" stroke-width="2.5" filter="url(#neonShadow)" />
                <line x1="34" y1="32" x2="38" y2="32" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
                <line x1="44" y1="32" x2="66" y2="32" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6" />
                
                <!-- Server 2 -->
                <rect x="28" y="44" width="44" height="12" rx="3.5" fill="none" stroke="#ffffff" stroke-width="2.5" filter="url(#neonShadow)" />
                <line x1="34" y1="50" x2="38" y2="50" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
                <line x1="44" y1="50" x2="66" y2="50" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6" />
                
                <!-- Server 3 -->
                <rect x="28" y="62" width="44" height="12" rx="3.5" fill="none" stroke="#ffffff" stroke-width="2.5" filter="url(#neonShadow)" />
                <line x1="34" y1="68" x2="38" y2="68" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
                <line x1="44" y1="68" x2="66" y2="68" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6" />
              </svg>
            </div>

            <!-- Server Status Pill -->
            <div class="status-pill">
              <span class="status-dot"></span>
              Servidor Activo
            </div>

            <!-- Subtitle and Vaporwave Headings -->
            <div class="subtitle-top">Servidor de Pruebas</div>
            <h1 class="main-title">
              <span class="title-gradient-white">Grupo </span>
              <span class="title-gradient-colored">#5</span>
            </h1>

            <p class="card-desc">
              Este host pertenece al Grupo #5. Entorno de pruebas y desarrollo.
            </p>

            <div class="divider"></div>

            <!-- Member list with Dabric Interactive Blur/Atenuado Hover Effect -->
            <div class="members-list" [class.has-hovered]="hoveredMemberIndex() !== null">
              @for (member of members; track $index) {
                <div 
                  class="member-item" 
                  [class.cyan-theme]="member.theme === 'cyan'"
                  [class.purple-theme]="member.theme === 'purple'"
                  [class.is-hovered]="hoveredMemberIndex() === $index"
                  (mouseenter)="hoveredMemberIndex.set($index)"
                  (mouseleave)="hoveredMemberIndex.set(null)"
                  (click)="queryMember($index)"
                >
                  <div class="member-avatar">
                    {{ member.avatarText }}
                  </div>
                  <div class="member-info">
                    <span class="member-name">{{ member.name }}</span>
                    <span class="member-role">{{ member.role }}</span>
                  </div>
                </div>
              }
            </div>

            <div class="card-footer">
              Host operado por Grupo #5 — uso interno
            </div>

            <!-- Collapsible Interactive Console/Terminal -->
            <div class="terminal-container">
              <div class="terminal-header" (click)="toggleConsole()">
                <div class="terminal-title">
                  <span class="terminal-dot"></span>
                  console.log — bash
                </div>
                <div class="terminal-arrow" [class.collapsed]="consoleCollapsed()">▼</div>
              </div>
              
              <div class="terminal-body" #terminalBody [class.collapsed]="consoleCollapsed()">
                @for (log of logs(); track $index) {
                  <div class="terminal-log-line">
                    <span class="log-time">[{{ log.time }}]</span>
                    <span class="log-tag" [class.info]="log.type === 'info'" [class.success]="log.type === 'success'" [class.warning]="log.type === 'warning'" [class.input]="log.type === 'input'">
                      {{ log.tag }}
                    </span>
                    <span class="log-content">{{ log.content }}</span>
                  </div>
                }
                
                <!-- Prompt Line -->
                <div class="terminal-input-line">
                  <span class="terminal-prompt">></span>
                  <input 
                    type="text" 
                    class="terminal-textbox" 
                    [(ngModel)]="commandInput" 
                    (keydown.enter)="executeCommand()"
                    placeholder="Escribe 'help'..."
                    aria-label="Terminal command input"
                  />
                  <span class="terminal-cursor"></span>
                </div>
              </div>
            </div>

          </div>
        }
      </div>
    }
  `,
  styles: [`
    .shutdown-screen {
      animation: zoomIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes zoomIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class App {
  @ViewChild('terminalBody') private terminalBody?: ElementRef;

  protected readonly isShutdown = signal(false);
  protected readonly isMinimized = signal(false);
  protected readonly consoleCollapsed = signal(false);
  protected readonly hoveredMemberIndex = signal<number | null>(null);
  
  protected commandInput = '';
  protected readonly logs = signal<LogLine[]>([]);

  protected readonly members: Member[] = [
    {
      name: 'Juan Manuel Martinez Jojoa',
      role: 'Estudiante · Grupo #5',
      avatarText: 'N1',
      theme: 'cyan',
      detailRole: 'DevOps & Backend Engineer',
      bio: 'Especialista en infraestructura, automatización y desarrollo de APIs en Node.js/Angular.'
    },
    {
      name: 'Gersain Leal Muñoz',
      role: 'Estudiante · Grupo #5',
      avatarText: 'N2',
      theme: 'purple',
      detailRole: 'UI/UX & Frontend Designer',
      bio: 'Apasionado por el diseño de interfaces modernas, transiciones avanzadas y experiencia de usuario.'
    }
  ];

  constructor() {
    // Initial logs setup
    this.addLog('info', 'SYS', 'Inicializando sistema de pruebas...');
    setTimeout(() => this.addLog('info', 'SYS', 'Conectando a host remoto Grupo #5...'), 400);
    setTimeout(() => this.addLog('success', 'OK', 'Conexión establecida. Servidor activo.'), 900);
    setTimeout(() => this.addLog('info', 'SYS', 'Integrantes en línea: Juan M., Gersain L.'), 1400);
    setTimeout(() => this.addLog('success', 'HELP', "Escribe 'help' para ver la lista de comandos."), 1800);

    // Auto-scroll terminal when logs change
    effect(() => {
      if (this.logs().length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  private getTimeString(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  private addLog(type: 'info' | 'success' | 'input' | 'warning', tag: string, content: string): void {
    const newLog: LogLine = {
      time: this.getTimeString(),
      type,
      tag: `[${tag}]`,
      content
    };
    this.logs.update(current => [...current, newLog]);
  }

  protected toggleMinimize(): void {
    this.isMinimized.update(val => !val);
  }

  protected toggleConsole(): void {
    this.consoleCollapsed.update(val => !val);
    if (!this.consoleCollapsed()) {
      setTimeout(() => this.scrollToBottom(), 50);
    }
  }

  protected shutdownServer(): void {
    this.isShutdown.set(true);
  }

  protected rebootServer(): void {
    this.isShutdown.set(false);
    this.logs.set([]);
    this.addLog('warning', 'BOOT', 'Reiniciando sistema de pruebas...');
    setTimeout(() => this.addLog('info', 'SYS', 'Re-conectando host...'), 500);
    setTimeout(() => this.addLog('success', 'OK', 'Servidor de pruebas levantado con éxito.'), 1000);
  }

  protected queryMember(index: number): void {
    if (this.consoleCollapsed()) {
      this.consoleCollapsed.set(false);
    }
    const member = this.members[index];
    this.addLog('input', 'CLICK', `query --member "${member.avatarText}"`);
    setTimeout(() => {
      this.addLog('info', 'INFO', `Consultando registro: ${member.name}`);
      this.addLog('success', 'ROLE', `Rol: ${member.detailRole}`);
      this.addLog('success', 'BIO', `Detalle: ${member.bio}`);
    }, 200);
  }

  protected executeCommand(): void {
    const rawCmd = this.commandInput.trim();
    if (!rawCmd) return;

    this.addLog('input', 'EXEC', rawCmd);
    this.commandInput = '';

    const cmd = rawCmd.toLowerCase();

    setTimeout(() => {
      switch (cmd) {
        case 'help':
          this.addLog('info', 'HELP', 'Comandos disponibles:');
          this.addLog('info', 'CMD', '  status  - Estadísticas de recursos del servidor.');
          this.addLog('info', 'CMD', '  members - Lista de integrantes del Grupo #5.');
          this.addLog('info', 'CMD', '  ping    - Test de latencia al servidor.');
          this.addLog('info', 'CMD', '  juan    - Consultar info de Juan Manuel.');
          this.addLog('info', 'CMD', '  gersain - Consultar info de Gersain.');
          this.addLog('info', 'CMD', '  reboot  - Reiniciar el servidor de logs.');
          this.addLog('info', 'CMD', '  clear   - Limpiar pantalla de consola.');
          break;
        case 'clear':
          this.logs.set([]);
          break;
        case 'status':
          const load = Math.floor(Math.random() * 15) + 5;
          const ram = (Math.random() * 2 + 3).toFixed(1);
          this.addLog('success', 'STAT', `--- ESTADO DEL SERVIDOR ---`);
          this.addLog('info', 'STAT', `Uptime: 2h 45m 12s`);
          this.addLog('info', 'STAT', `CPU: ${load}% (Intel Xeon 8 Cores)`);
          this.addLog('info', 'STAT', `RAM: ${ram} GB / 16.0 GB`);
          this.addLog('info', 'STAT', `Red: 150 Mbps bajada | 50 Mbps subida`);
          this.addLog('success', 'STAT', `Estado de servicios: 100% operativo.`);
          break;
        case 'members':
          this.addLog('success', 'LIST', `--- INTEGRANTES DEL GRUPO #5 ---`);
          this.members.forEach((m, idx) => {
            this.addLog('info', 'LIST', `${idx + 1}. ${m.name} (${m.avatarText}) - ${m.role}`);
          });
          break;
        case 'ping':
          this.addLog('info', 'PING', 'Haciendo ping a grupo5.server.local [127.0.0.1]...');
          setTimeout(() => this.addLog('info', 'PING', 'Respuesta de 127.0.0.1: bytes=32 tiempo=12ms TTL=64'), 100);
          setTimeout(() => this.addLog('info', 'PING', 'Respuesta de 127.0.0.1: bytes=32 tiempo=10ms TTL=64'), 250);
          setTimeout(() => {
            this.addLog('info', 'PING', 'Respuesta de 127.0.0.1: bytes=32 tiempo=11ms TTL=64');
            this.addLog('success', 'PING', 'Estadísticas: Enviados = 3, Recibidos = 3, Perdidos = 0 (0% loss)');
          }, 400);
          break;
        case 'juan':
          this.queryMember(0);
          break;
        case 'gersain':
          this.queryMember(1);
          break;
        case 'reboot':
          this.rebootServer();
          break;
        default:
          this.addLog('warning', 'ERR', `Comando no reconocido: '${rawCmd}'. Escribe 'help' para ayuda.`);
      }
    }, 150);
  }

  private scrollToBottom(): void {
    if (this.terminalBody) {
      const element = this.terminalBody.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}

