import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
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
import { MenuItem } from 'primeng/api';
import { NgOptimizedImage } from '@angular/common';
import { Authority } from '../../config/authority.constants';

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
  private isAdmin: boolean = false;

  private loginService = inject(LoginService);
  private translateService = inject(TranslateService);
  private stateStorageService = inject(StateStorageService);
  private profileService = inject(ProfileService);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private accountService = inject(AccountService);

  constructor() {
    if (VERSION) {
      this.version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
    }

    const isAdmin = computed(() => this.account()?.authorities && this.accountService.hasAnyAuthority(Authority.ADMIN));
    effect(
      () => {
        this.isAdmin = !!isAdmin();
        this.updateMenuItems();
      },
      { allowSignalWrites: true },
    );
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
        visible: this.isAdmin,
        label: this.getMenuLabel('global.menu.admin.main'),
        icon: 'pi pi-cog',
        items: [
          {
            label: this.getMenuLabel('global.menu.entities.adminAuthority'),
            routerLink: '/authority',
          },
          {
            label: this.getMenuLabel('global.menu.admin.userManagement'),
            routerLink: '/admin/user-management',
          },
          {
            label: this.getMenuLabel('global.menu.admin.metrics'),
            routerLink: '/admin/metrics',
          },
          {
            label: this.getMenuLabel('global.menu.admin.health'),
            routerLink: '/admin/health',
          },
          {
            label: this.getMenuLabel('global.menu.admin.configuration'),
            routerLink: '/admin/configuration',
          },
          {
            label: this.getMenuLabel('global.menu.admin.logs'),
            routerLink: '/admin/logs',
          },
          {
            label: this.getMenuLabel('global.menu.admin.apidocs'),
            routerLink: '/admin/docs',
          },
          {
            label: this.getMenuLabel('global.menu.admin.database'),
            url: './h2-console/',
            visible: !this.inProduction,
          },
        ],
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
            visible: this.account() === null,
            label: this.getMenuLabel('global.menu.account.login'),
            icon: 'pi pi-sign-in',
            routerLink: '/login',
          },
          {
            visible: this.account() === null,
            label: this.getMenuLabel('global.menu.account.register'),
            icon: 'pi pi-user-plus',
            routerLink: '/account/register',
          },
          {
            visible: this.account() !== null,
            label: this.getMenuLabel('global.menu.account.settings'),
            icon: 'pi pi-wrench',
            routerLink: '/account/settings',
          },
          {
            visible: this.account() !== null,
            label: this.getMenuLabel('global.menu.account.password'),
            icon: 'pi pi-lock',
            routerLink: '/account/password',
          },
          {
            visible: this.account() !== null,
            label: this.getMenuLabel('global.menu.account.logout'),
            icon: 'pi pi-sign-out',
            command: () => this.logout(),
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
