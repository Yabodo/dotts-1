<template>
    <div>
        <div>
            <div class="terms">
                <div style="margin: 1rem 0;" class="intro">
                    <h2 class="title">
                        {{ $t('components.legal.privacyPolicy.title') }}
                    </h2>
                    <div class="disclaimer">
                        {{ $t('components.legal.privacyPolicy.missingLanguageDisclaimer') }}
                    </div>
                </div>
                <div class="content">
                    <div v-for="(section, i) in $t('components.legal.privacyPolicy.sections')" :key="i" class="section">
                        <div v-for="(paragraph, j) in section.paragraphs" :key="j" class="paragraph">
                            <h4 style="margin-bottom: -0.5rem;">{{j+1}}. {{paragraph.title}}</h4>
                            <div style="margin: 0.5rem 0;" v-for="(sub, k) in paragraph.subs" :key="k">
                                <div v-if="typeof sub == 'string'"><p>{{sub}}</p></div>
                                <div style="margin-bottom: -0.5rem;" v-if="typeof sub == 'object'"><b>{{sub.title}}</b></div>
                                <div style="margin: 1rem;"  v-if="Array.isArray(sub)">
                                    <ul>
                                        <li v-for="(line, l) in sub" :key="l">
                                            <div style="margin-bottom: -0.5rem;" v-if="typeof line == 'object'"><b>{{ line.title }}</b></div>
                                            <div style="margin: 0.5rem 0;" v-if="typeof line == 'string'"><p>{{ line }}</p></div>
                                            <div style="margin: 1rem;" v-if="Array.isArray(line)">
                                                <ul>
                                                    <li v-for="(subline, m) in line" :key="m">
                                                        <div v-if="typeof subline == 'object'"><b>{{ subline.title }}</b></div>
                                                        <div v-if="typeof subline == 'string'"><p>{{ subline }}</p></div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>