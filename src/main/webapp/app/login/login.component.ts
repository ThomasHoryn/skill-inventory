import { Component, OnInit, AfterViewInit, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { LoginService } from 'app/login/login.service';
import { AccountService } from 'app/core/auth/account.service';
import { MessagesModule } from 'primeng/messages';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../shared/language/translation.service';
import { Message } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { Button, ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';

@Component({
  standalone: true,
  selector: 'jhi-login',
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MessagesModule,
    InputTextModule,
    ButtonDirective,
    Ripple,
    CheckboxModule,
    DividerModule,
    Button,
  ],
  templateUrl: './p-login.component.html',
  animations: [
    trigger('fade', [
      state('visible', style({ display: 'block', opacity: 1 })),
      state('hidden', style({ display: 'none', opacity: 0 })),
      transition('visible <=> hidden', animate('500ms ease-in-out')),
    ]),
  ],
})
export default class LoginComponent implements OnInit, AfterViewInit {
  username = viewChild.required<ElementRef>('username');

  authenticationError = signal(false);

  loginForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rememberMe: new FormControl(false, { nonNullable: true, validators: [Validators.required] }),
  });

  private accountService = inject(AccountService);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private translationService = inject(TranslationService);

  authenticationErrorMsg: Message[] = [];

  ngOnInit(): void {
    // if already authenticated then navigate to home page
    this.accountService.identity().subscribe(() => {
      if (this.accountService.isAuthenticated()) {
        this.router.navigate(['']);
      }
    });
    this.translateService.onLangChange.subscribe(() => {
      this.updateErrorItems();
    });

    this.updateErrorItems();
  }

  ngAfterViewInit(): void {
    this.username().nativeElement.focus();
  }

  private updateErrorItems() {
    this.authenticationErrorMsg = [
      {
        severity: 'error',
        detail: this.getTranslation('login.messages.error.authentication'),
      },
    ];
  }

  getTranslation(description: string): string {
    return this.translationService.getTranslation(description);
  }

  login(): void {
    this.loginService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.authenticationError.set(false);
        if (!this.router.getCurrentNavigation()) {
          // There were no routing during login (eg from navigationToStoredUrl)
          this.router.navigate(['']);
        }
      },
      error: () => this.authenticationError.set(true),
    });
  }
}
