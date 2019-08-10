import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../../../router.animations';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.scss'],
    animations: [routerTransition()]
})
export class InfoComponent implements OnInit {
    public sliders: Array<any>;

    constructor(
        private translateService: TranslateService,
        private cookieService: CookieService
    ) {}

    ngOnInit() {
        this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
            if (event.lang === 'en') {
                this.loadSlidersEn();
            } else {
                this.loadSlidersEs();
            }
        });

        if (this.cookieService.get('lang') === 'en' || !(this.cookieService.check('lang'))) {
           this.loadSlidersEn();
        } else {
            this.loadSlidersEs();
        }
        }

    private loadSlidersEn(): void {
        this.sliders =  [{
            imagePath: '../../../../assets/img/slider1.jpg',
            label: "What is Tweet 'N' Sell?",
            // tslint:disable-next-line: max-line-length
            text: "Djinn Viziers have the power to tell the future. Anyone possessing a genie's lamp will always be lucky in battle, and his enemy will be subjected to many misfortunes. The Djinns themselves decide how to give their luck. They may provide good luck to their master's allies, or bad luck to the forces of his enemies."
        },
        {
            imagePath: '../../../../assets/img/slider2.jpg',
            label: 'Who can benefit from it?',
            // tslint:disable-next-line: max-line-length
            text: 'Steel golems are carefully enchanted by their creators. They are almost impervious to magic (receiving only quarter of damage from magical attacks) and far more deadly than the lesser iron golems in combat, as they retaliate immediately any time they are attacked.'
        },
        {
            imagePath: '../../../../assets/img/slider1.jpg',
            label: 'How can it help me improve the marketing strategy of my business?',
            // tslint:disable-next-line: max-line-length
            text: 'The fabled properties of the Mystical Marble, from which the Elemental Gargoyles are formed, have been well documented since time immemorial. This rarest of stones is widely prized by the wizard fraternity for its unique ability to transform the properties of any natural force. Under the influence of the Elemental Gargoyle, fire, water and earth can be transformed into destructive weapons.'
        },
        {
            imagePath: '../../../../assets/img/slider2.jpg',
            label: 'How can I monitor the online reputation of my brand?',
            // tslint:disable-next-line: max-line-length
            text: 'The Academy has returned to its grassroots with a more middle-eastern themed town set in the deserts, and thus it reflects the art style and clothing of its creatures. The Academy line-up remains largely familiar, the only change being the many-armed snake woman for the many-armed lion-man. The Rakshasa is a new creature to the series that reflects the middle-eastern mythology associated with the town. The Academy, traditionally a strong spellcasting town, have continued the trend with the Genie and the Mage occupying levels 4 and 5 for two strong, mid-level spellcasters. Their ranged capability is also powerful, as in Heroes IV with both Gremlins, Mages and Titans able to fire shots at long range. A predominantly unchanged line-up ensures a fairly familiar town for Academy players.'
        },
        {
            imagePath: '../../../../assets/img/slider3.jpg',
            label: 'How can I look for potential influencers among my followers on Twitter?',
            // tslint:disable-next-line: max-line-length
            text: 'In the beautiful surroundings of Khalef Oasis resides old Naef Al Majalla, the greatest general the Silver Cities have ever known. It is to him that mages come, in the hope of learning how to harness their magic powers in battle, and use it accurately against the enemy without harming their own men.'
        }];
    }

    private loadSlidersEs(): void {
        this.sliders = [
            {
                imagePath: '../../../../assets/img/slider1.jpg',
                label: "¿Qué es Tweet 'N' Sell?",
                // tslint:disable-next-line: max-line-length
                text: 'Un total de 14.262 personas han asistido hasta la fecha a las Noches en los Jardines del Real Alcázar de Sevilla, una cifra que se corresponde con una ocupación del 98 por ciento del aforo ofertado desde su inauguración el 27 de junio.'
            },
            {
                imagePath: '../../../../assets/img/slider2.jpg',
                label: '¿A quién está destinado?',
                // tslint:disable-next-line: max-line-length
                text: 'Ofrecerán el programa: Ministriles para una vuelta al mundo. Esto será un homenaje a la figura del marino y descubridor Fernando de Magallanes. El recital es un recorrido por las músicas que se escucharon en los reinos de Portugal, Castilla y Aragón durante el floreciente Renacimiento europeo, con pequeños guiños a la música profanaamericana del siglo XVI, para evocar las nuevas culturas descubiertas, según el comunicado.'
            },
            {
                imagePath: '../../../../assets/img/slider1.jpg',
                label: '¿Cómo puede ayudarme a mejorar la estrategia de marketing de mi negocio?',
                // tslint:disable-next-line: max-line-length
                text: 'Los más intrépidos estaban esperando el 11 de mayo para lanzarse. Y la mayoría lo hizo sin problemas. Fueron muchos los jóvenes, incluso familias con hijos, que se tiraron por el tobogán más grande de Europa en Estepona. Sin embargo, otros no hicieron caso a las normas de uso y pillaron demasiada velocidad. Tanta que acabaron magullados. Es cuando llegó una señora con vestido azul, se tendió sobre el acero de la atracción y bajó a toda velocidad.'
            },
            {
                imagePath: '../../../../assets/img/slider2.jpg',
                label: '¿Cómo puedo monitiorizar la reputación online de mi marca?',
                // tslint:disable-next-line: max-line-length
                text: 'En las siguientes horas, otros usuarios de este tobogán se quejaron de que habían sufrido moratones. Una de ellas, además, lo hacía diciendo que la Policía Local se había reído de ella cuando la vio tirada por los suelos, con los codos amoratados y el trasero quemado por la fricción. Comenzó una marea de críticas que hizo, que esa misma tarde, el tobogán fuera clausurado hasta nueva orden. Un operario lo precintó y en la entrada se cortó el acceso.'
            },
            {
                imagePath: '../../../../assets/img/slider3.jpg',
                label: '¿Cómo puedo buscar posibles influencers entre mis seguidores de Twitter?',
                // tslint:disable-next-line: max-line-length
                text: 'En las siguientes horas, otros usuarios de este tobogán se quejaron de que habían sufrido moratones. Una de ellas, además, lo hacía diciendo que la Policía Local se había reído de ella cuando la vio tirada por los suelos, con los codos amoratados y el trasero quemado por la fricción. Comenzó una marea de críticas que hizo, que esa misma tarde, el tobogán fuera clausurado hasta nueva orden. Un operario lo precintó y en la entrada se cortó el acceso.'
            }
        ];
    }

}
