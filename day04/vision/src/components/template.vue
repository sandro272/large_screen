<template>
	<div class="com-container">
		<div class="com-chart" ref="trend_ref"></div>
	</div>
</template>

<script>
export default {
	data () {
		return {
			ChartInstance: null,
			AllData: null
		}
	},
	mounted () {
		this.initChart()
		this.getData()
		window.addEventListener('resize', this.screenAdapter)
		this.screenAdapter()
	},
	destroyed () {
		window.removeEventListener('resize', this.screenAdapter)
	},
	methods: {
		initChart () {
			this.ChartInstance = this.$echarts.init(this.$refs.trend_ref)
			const initOption = {}
			this.ChartInstance.setOption(initOption)
		},
		getData () {
			this.updateChart()
		},
		updateChart () {
			const dataOption = {}
			this.ChartInstance.setOption(dataOption)
		},
		screenAdapter () {
			const adapterOption = {}
			this.ChartInstance.setOption(adapterOption)
			this.ChartInstance.resize()
		}
	}

		
	}
</script>
<style lang="less" scoped></style>
