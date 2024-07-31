import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import 'zone.js';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

export type MediaType = 'audio' | 'video';

export interface TestResult {
  config: MediaDecodingConfiguration;
  results: MediaCapabilitiesDecodingInfo;
  type: MediaType;
}

@Component({
  selector: 'app-root',
  standalone: true,
  styleUrl: './main.component.css',
  templateUrl: './main.component.html',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class App {
  isSupported: boolean = 'mediaCapabilities' in navigator;
  form: FormGroup = new FormGroup({
    type: new FormControl<string>(''),
    audio: new FormGroup({
      contentType: new FormControl<string | null>(null),
      channels: new FormControl<number | null>(null),
      bitrate: new FormControl<number | null>(null),
      samplerate: new FormControl<number | null>(null),
    }),
    video: new FormGroup({
      codec: new FormControl<string | null>(null),
      size: new FormControl<string | null>(null),
      framerate: new FormControl<number | null>(null),
      bitrate: new FormControl<number | null>(null),
    }),
  });
  options: any = {
    audio: {
      contentType: [
        'audio/aac',
        'audio/midi',
        'audio/mp3',
        'audio/ogg',
        'audio/wav',
      ],
      channels: [1, 2],
      bitrate: [64000, 128000, 160000, 192000, 256000, 320000, 960000, 1411000],
      samplerate: [5200, 22000, 44100, 48000],
    },
    video: {
      codec: [
        'video/3gpp; codecs=h.264',
        'video/3gpp; codecs=vp8',
        'video/mp4; codecs=avc1',
        'video/mp4; codecs=avc1.420034',
        'video/ogg; codecs=theora',
        'video/webm; codecs=vp8',
        'video/webm; codecs=vp9',
      ],
      height: [240, 480, 600, 720, 1080, 1440, 2160, 4320],
      width: [320, 640, 800, 1280, 1920, 2560, 3840, 7680],
      framerate: [15, 24, 25, 30, 48, 50, 60],
      bitrate: [
        800, 1000, 2500, 4000, 5000, 6000, 7500, 8000, 12000, 16000, 24000,
        36000,
      ],
    },
  };
  testResults: TestResult[] = [];

  constructor() {
    this.options.video.size = this.options.video.width.map(
      (w: number, i: number) => {
        const h = this.options.video.height[i];
        return w + 'x' + h;
      }
    );
  }

  buildConfiguration(): MediaDecodingConfiguration {
    let config: any = {
      type: 'file',
    };
    const vals = this.form.value;

    if (this.type === 'audio') {
      const { contentType, channels, bitrate, samplerate } = vals.audio;
      config.audio = {
        contentType,
        channels,
        bitrate,
        samplerate,
      };
    } else {
      const { codec, size, framerate, bitrate } = vals.video;
      const [width, height] = size.split('x');
      config.video = {
        contentType: codec,
        width,
        height,
        framerate,
        bitrate,
      };
    }

    return config;
  }

  get canTest(): boolean {
    const vals = this.form.value;
    let result: boolean = false;
    if (this.type === 'audio') {
      const { contentType, channels, bitrate, samplerate } = vals.audio;
      result = !!contentType && !!channels && !!bitrate && !!samplerate;
    } else if (this.type === 'video') {
      const { codec, size, framerate, bitrate } = vals.video;
      result = !!codec && !!size && !!framerate && !!bitrate;
    }
    return result;
  }

  logResult(
    config: MediaDecodingConfiguration,
    results: MediaCapabilitiesDecodingInfo
  ): void {
    const type = 'audio' in config ? 'audio' : 'video';
    this.testResults.push({
      type,
      config,
      results,
    });
  }

  test(): void {
    const config: MediaDecodingConfiguration = this.buildConfiguration();

    navigator.mediaCapabilities
      .decodingInfo(config)
      .then((result) => {
        console.log(result);
        this.logResult(config, result);
      })
      .catch((err) => {
        // pop up a notification or something
        console.error(err);
      });
  }

  get type(): string {
    return this.form.controls['type'].value;
  }
}

bootstrapApplication(App, {
  providers: [provideAnimationsAsync()],
});
