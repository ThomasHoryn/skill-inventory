import { AfterViewInit, Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

import { EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE } from 'app/config/error.constants';
import SharedModule from 'app/shared/shared.module';
import PasswordStrengthBarComponent from '../password/password-strength-bar/password-strength-bar.component';
import { RegisterService } from './register.service';
import { DialogModule } from 'primeng/dialog';
import { Button, ButtonDirective } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { StyleClassModule } from 'primeng/styleclass';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Ripple } from 'primeng/ripple';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
import { TranslationService } from '../../shared/language/translation.service';

@Component({
  standalone: true,
  selector: 'jhi-register',
  imports: [
    StyleClassModule,
    SharedModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PasswordStrengthBarComponent,
    DialogModule,
    Button,
    PasswordModule,
    CheckboxModule,
    InputTextModule,
    ButtonDirective,
    Ripple,
    MessagesModule,
  ],
  templateUrl: './p-register.component.html',
  animations: [
    trigger('fade', [
      state('visible', style({ display: 'block', opacity: 1 })),
      state('hidden', style({ display: 'none', opacity: 0 })),
      transition('visible <=> hidden', animate('500ms ease-in-out')),
    ]),
  ],
})
export default class RegisterComponent implements AfterViewInit, OnInit {
  login = viewChild.required<ElementRef>('login');

  doNotMatch = signal(false);
  error = signal(false);
  errorEmailExists = signal(false);
  errorUserExists = signal(false);
  success = signal(false);

  confirmPasswordErrorMsg: Message[] = [];
  userExistErrorMsg: Message[] = [];
  emailExistErrorMsg: Message[] = [];

  private translationService = inject(TranslationService);

  ngOnInit(): void {
    this.translateService.onLangChange.subscribe(() => {
      this.updateErrorItems();
    });
  }

  getTranslation(description: string): string {
    return this.translationService.getTranslation(description);
  }

  registerForm = new FormGroup({
    login: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'),
      ],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
  });

  get isLoginInvalid() {
    const loginControl = this.registerForm.get('login');
    return loginControl!.invalid && (loginControl!.dirty || loginControl!.touched);
  }

  get isEmailInvalid() {
    const EmailControl = this.registerForm.get('email');
    return EmailControl!.invalid && (EmailControl!.dirty || EmailControl!.touched);
  }

  get isPasswordInvalid() {
    const password = this.registerForm.get('password');
    return password!.invalid && (password!.dirty || password!.touched);
  }

  get isPasswordNotMatch() {
    const password = this.registerForm.get('password');
    const confirm = this.registerForm.get('confirmPassword');
    return (password!.dirty || password!.touched) && (confirm!.dirty || confirm!.touched) && password! !== confirm!;
  }

  get isConfirmPasswordInvalid() {
    const confirmPassword = this.registerForm.get('confirmPassword');
    return confirmPassword!.invalid && (confirmPassword!.dirty || confirmPassword!.touched);
  }

  private translateService = inject(TranslateService);
  private registerService = inject(RegisterService);

  ngAfterViewInit(): void {
    this.login().nativeElement.focus();
  }

  register(): void {
    this.doNotMatch.set(false);
    this.error.set(false);
    this.errorEmailExists.set(false);
    this.errorUserExists.set(false);

    const { password, confirmPassword } = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.doNotMatch.set(true);
    } else {
      const { login, email } = this.registerForm.getRawValue();
      this.registerService
        .save({ login, email, password, langKey: this.translateService.currentLang })
        .subscribe({ next: () => this.success.set(true), error: response => this.processError(response) });
    }
  }

  private processError(response: HttpErrorResponse): void {
    if (response.status === 400 && response.error.type === LOGIN_ALREADY_USED_TYPE) {
      this.errorUserExists.set(true);
    } else if (response.status === 400 && response.error.type === EMAIL_ALREADY_USED_TYPE) {
      this.errorEmailExists.set(true);
    } else {
      this.error.set(true);
    }
  }

  private updateErrorItems() {
    this.confirmPasswordErrorMsg = [
      {
        severity: 'error',
        detail: this.getTranslation('global.messages.error.dontmatch'),
      },
    ];
    this.userExistErrorMsg = [
      {
        severity: 'error',
        detail: this.getTranslation('register.messages.error.userexists'),
      },
    ];
    this.emailExistErrorMsg = [
      {
        severity: 'error',
        detail: this.getTranslation('register.messages.error.emailexists'),
      },
    ];
  }
}
