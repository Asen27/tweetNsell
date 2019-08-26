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
            imagePath: '../../../../assets/img/slider1.png',
            // tslint:disable-next-line: quotemark
            label: "What is Tweet 'N' Sell?",
            // tslint:disable-next-line: quotemark max-line-length
            text: "Nowadays, Twitter is one of the most popular social networks in the world and it has become a powerful tool that many companies add to their marketing strategy. Tweet 'N' Sell is a web application that aims to help businesses take the most of this social network."
        },
        {
            imagePath: '../../../../assets/img/slider2.png',
            label: 'Who can benefit from it?',
            // tslint:disable-next-line: quotemark max-line-length
            text: "Tweet 'N' Sell is intended for use by medium-sized and large enterprises that offer their services or products to English- or Spanish-speaking countries. In order to use the app, it’s required that your brand has an active account on Twitter. It’s also recommended that your brand’s account is popular and has a significant number of followers."
        },
        {
            imagePath: '../../../../assets/img/slider4.png',
            label: 'How can it help me improve the marketing strategy of my business?',
            // tslint:disable-next-line: quotemark max-line-length
            text: "Tweet 'N' Sell gives users the opportunity to monitor the online reputation of their brand. Using Tweet ‘N’ Sell, a company can measure the level of satisfaction of its customers towards the products or services it offers. The app is able to analyze how customers perceive the brand when they talk about it on Twitter (that is, whether their attitude is positive, negative or neutral). Tweet 'N' Sell also allows a company to identify potential influencers among their followers that could promote its products or services and help your brand grow."
        },
        {
            imagePath: '../../../../assets/img/slider3.png',
            label: 'How can I monitor the online reputation of my brand?',
            // tslint:disable-next-line: max-line-length
            text: 'The user will have to visit the Online Reputation page and click on the button: “Load more opinions”. The app will load and store the most recent tweets that refer to the brand. Once the tweets has been stored, the user will have to click on the button: “Evaluate all opinions”. The app will then proceed to analyze the stored tweets one by one. At the end of the process, the app will have classified the tweets as “positive”, “negative” or “neutral". The results will be illustrated by means of a chart.'
        },
        {
            imagePath: '../../../../assets/img/slider5.png',
            label: 'How can I look for potential influencers among my followers on Twitter?',
            // tslint:disable-next-line: max-line-length
            text: 'The user will have to go to the influence meter and click on the button “Load more followers”. The app will start iterating over the list of the brand’s followers and will store the potential influencers among them. These followers will be displayed in a table and the user will be able to see relevant information about them. When the user clicks on the button “Evaluate all followers”, the app will calculate the influence of each of the stored followers. When the process finishes, those that have the highest influence will be referred to as influencers and the user will be able to contact them.'
        }];
    }

    private loadSlidersEs(): void {
        this.sliders = [
            {
                imagePath: '../../../../assets/img/slider1.png',
                // tslint:disable-next-line: quotemark
                label: "¿Qué es Tweet 'N' Sell?",
                // tslint:disable-next-line: quotemark max-line-length
                text: "Hoy en día, Twitter es una de las redes sociales más populares del mundo y se ha convertido en una poderosa herramienta que muchas empresas suman a su estrategia de marketing. Tweet 'N' Sell es una aplicación web que pretende ayudar a las empresas a lograr los máximos beneficios de esta red social."
            },
            {
                imagePath: '../../../../assets/img/slider2.png',
                label: '¿A quién está destinado?',
                // tslint:disable-next-line: quotemark max-line-length
                text: "Tweet 'N' Sell está destinado a ser utilizado por marcas y empresas medianas o grandes que ofrecen sus servicios o productos en países de habla inglesa o española. Un requisito indispensable para usar la aplicación es que la empresa tenga una cuenta activa en Twitter. Es aconsejable también que la cuenta de Twitter de la empresa sea popular y cuente con un importante número de seguidores."
            },
            {
                imagePath: '../../../../assets/img/slider4.png',
                label: '¿Cómo puede ayudarme a mejorar la estrategia de marketing de mi negocio?',
                // tslint:disable-next-line: quotemark max-line-length
                text: "Tweet 'N' Sell le brinda al usuario la posibilidad de monitorizar la reputación online de su empresa. Gracias a Tweet ‘N’ Sell, la empresa puede determinar el nivel de satisfacción de sus clientes con los productos o los servicios ofrecidos. La aplicación es capaz de analizar cómo los clientes perciben la marca cuando la comentan por Twitter (esto es, si su actitud es positiva, negativa o neutral). Tweet 'N' Sell también posibilita que la empresa identifique entre sus seguidores en Twitter a potenciales influencers que podrían promocionar sus productos y servicios y ayudar al negocio a crecer."
            },
            {
                imagePath: '../../../../assets/img/slider3.png',
                label: '¿Cómo puedo monitorizar la reputación online de mi marca?',
                // tslint:disable-next-line: max-line-length
                text: 'El usuario tiene que visitar la página de monitorización de la reputación online y hacer clic en el botón “Cargar más opiniones”. La aplicación cargará y almacenará los tweets más recientes que se refieran a la marca. Una vez que los tweets hayan sido almacenados, el usuario tendrá que hacer clic en el botón “Evaluar todas las opiniones”. La aplicación procederá a recorrer los tweets almacenados, analizando el texto de cada uno de ellos de forma individual. Al final del proceso, la aplicación habrá catalogado cada uno de los tweets como “positivo”, “negativo” o “neutral”. Los resultados se ilustrarán mediante un gráfico.'
            },
            {
                imagePath: '../../../../assets/img/slider5.png',
                label: '¿Cómo puedo buscar posibles influencers entre mis seguidores de Twitter?',
                // tslint:disable-next-line: max-line-length
                text: 'El usuario tiene que acceder al medidor de influencia y pulsar el botón “Cargar más seguidores”. La aplicación irá recorriendo la lista de los seguidores de la marca en Twitter e irá almacenando a los potenciales influencers. Dichos seguidores se visualizarán en un listado y el usuario podrá consultar sus datos más relevantes. Cuando el usuario pulse el botón “Evaluar a todos los seguidores”, la aplicación irá calculando la influencia de cada uno de los seguidores del listado. Cuando el proceso termine, aquellos que tengan la influencia más alta se distinguirán como influencers y el usuario podrá ponerse en contacto con ellos, si lo desea.'
            }
        ];
    }

}
