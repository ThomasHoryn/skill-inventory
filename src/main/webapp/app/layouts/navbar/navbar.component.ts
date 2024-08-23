import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { StateStorageService } from 'app/core/auth/state-storage.service';
import SharedModule from 'app/shared/shared.module';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { VERSION } from 'app/app.constants';
import { LANGUAGES } from 'app/config/language.constants';
import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import { EntityNavbarItems } from 'app/entities/entity-navbar-items';
import ActiveMenuDirective from './active-menu.directive';
import NavbarItem from './navbar-item.model';
import { MenubarModule } from 'primeng/menubar';
import { TagModule } from 'primeng/tag';
import PageRibbonComponent from '../profiles/page-ribbon.component';
import { TranslationService } from '../../shared/language/translation.service';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { NgOptimizedImage } from '@angular/common';

@Component({
  standalone: true,
  selector: 'jhi-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [
    RouterModule,
    SharedModule,
    HasAnyAuthorityDirective,
    ActiveMenuDirective,
    MenubarModule,
    TagModule,
    PageRibbonComponent,
    NgOptimizedImage,
  ],
})
export default class NavbarComponent implements OnInit {
  inProduction?: boolean;
  isNavbarCollapsed = signal(true);
  languages = LANGUAGES;
  openAPIEnabled?: boolean;
  version = '';
  account = inject(AccountService).trackCurrentAccount();
  entitiesNavbarItems: NavbarItem[] = [];
  items: MenuItem[] = [];

  private loginService = inject(LoginService);
  private translateService = inject(TranslateService);
  private stateStorageService = inject(StateStorageService);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  constructor() {
    if (VERSION) {
      this.version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
    }
  }

  ngOnInit(): void {
    this.entitiesNavbarItems = EntityNavbarItems;
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction = profileInfo.inProduction;
      this.openAPIEnabled = profileInfo.openAPIEnabled;
    });

    this.translateService.onLangChange.subscribe(() => {
      this.updateMenuItems();
    });
  }

  getMenuLabel(label: string): string {
    return this.translationService.getTranslation(label);
  }

  updateMenuItems(): void {
    this.items = [
      {
        label: this.getMenuLabel('global.menu.home'),
        icon: 'pi pi-home',
        routerLink: '/',
      },
      {
        label: this.getMenuLabel('global.menu.language'),
        icon: 'pi pi-flag',
        items: [
          {
            label: 'English',
            command: () => this.changeLanguage('en'),
          },
          {
            label: 'Deutsch',
            command: () => this.changeLanguage('de'),
          },
          {
            label: 'Polski',
            command: () => this.changeLanguage('pl'),
          },
        ],
      },
      {
        label: this.getMenuLabel('global.menu.account.main'),
        icon: 'pi pi-user',
        items: [
          {
            label: this.getMenuLabel('global.menu.account.login'),
            icon: 'pi pi-sign-in',
            routerLink: '/login',
          },
          {
            label: this.getMenuLabel('global.menu.account.register'),
            icon: 'pi pi-user-plus',
            routerLink: '/account/register',
          },
        ],
      },
    ];
  }

  changeLanguage(languageKey: string): void {
    this.stateStorageService.storeLocale(languageKey);
    this.translateService.use(languageKey);
  }

  collapseNavbar(): void {
    this.isNavbarCollapsed.set(true);
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.collapseNavbar();
    this.loginService.logout();
    this.router.navigate(['']);
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed.update(isNavbarCollapsed => !isNavbarCollapsed);
  }
}
