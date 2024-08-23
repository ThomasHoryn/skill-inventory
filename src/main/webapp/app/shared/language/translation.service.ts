import { inject, Injectable } from '@angular/core';
import { translationNotFoundMessage } from '../../config/translation.config';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translateService = inject(TranslateService);

  public getTranslation(toTranslate: string): string {
    let translation: string = '';
    this.translateService.get(toTranslate).subscribe({
      next: value => {
        translation = value;
      },
      error: () => `${translationNotFoundMessage}[${toTranslate}]`,
    });
    return translation;
  }
}
